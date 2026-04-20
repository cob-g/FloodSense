import express from 'express';
import SensorData from '../models/SensorData.js';
import Sensor from '../models/Sensor.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getIO } from '../socket.js';
import { writeAdminLog, ADMIN_ACTIONS, ADMIN_ENTITIES } from '../services/adminAudit.service.js';

const router = express.Router();

// @route   POST /api/sensor-data
// @desc    Receive sensor data from ESP32
// @access  Public (ESP32 device)
router.post('/sensor-data', async (req, res) => {
  try {
    const { distance, sensorId: sensorIdBody = null, sensor_id = null, lat = null, lng = null, latitude = null, longitude = null, location } = req.body;
    
    // Validate distance
    if (typeof distance !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid distance. Must be a number.' 
      });
    }
    
    // Normalize location fields and location name
    let locationName = null;
    if (typeof location === 'string') {
      locationName = location;
    } else if (location && typeof location === 'object' && typeof location.name === 'string') {
      locationName = location.name;
    }

    const latNum = Number(latitude ?? lat);
    const lngNum = Number(longitude ?? lng);
    const loc = location && typeof location === 'object' && (location.lat != null || location.lng != null)
      ? { lat: Number(location.lat ?? latNum) || null, lng: Number(location.lng ?? lngNum) || null }
      : { lat: Number(latNum) || null, lng: Number(lngNum) || null };

    // Prefer camelCase sensorId; accept snake_case from devices
    const sensorId = sensorIdBody || sensor_id || null;

    // Enrich using registry if available (registry is authoritative)
    let reg = null;
    if (sensorId) {
      reg = await Sensor.findOne({ sensorId }).lean();
    }
    if (reg) {
      locationName = reg.locationName ?? locationName;
      if (typeof reg.latitude === 'number' && typeof reg.longitude === 'number') {
        loc.lat = reg.latitude;
        loc.lng = reg.longitude;
      }
    }

    // Create new sensor reading
    const newData = new SensorData({ distance, sensorId, location: loc, locationName });
    await newData.save();
    
    console.log(`📊 Sensor reading saved: ${distance} cm at ${newData.timestamp}`);
    
    // Emit real-time update via Socket.IO
    const io = getIO();
    io.emit('update', newData);
    
    res.status(200).json({ 
      success: true, 
      data: newData 
    });
  } catch (err) {
    console.error('Error saving sensor data:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// @route   GET /api/sensor-data
// @desc    Get recent sensor readings
// @access  Public
router.get('/sensor-data', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const readings = await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor data'
    });
  }
});

// @route   GET /api/sensor-data/latest
// @desc    Get the most recent sensor reading
// @access  Public
router.get('/sensor-data/latest', async (req, res) => {
  try {
    const latest = await SensorData.findOne()
      .sort({ timestamp: -1 });
    
    if (!latest) {
      return res.status(404).json({
        success: false,
        error: 'No sensor data available'
      });
    }
    
    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest sensor data'
    });
  }
});

// @route   GET /api/sensors
// @desc    List registered sensors
// @access  Admin (no auth check here; assumed handled by parent or future middleware)
router.get('/sensors', async (req, res) => {
  try {
    const sensors = await Sensor.find().sort({ createdAt: -1 });
    res.json({ success: true, count: sensors.length, data: sensors });
  } catch (error) {
    console.error('Error fetching sensors registry:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sensors' });
  }
});

// @route   POST /api/sensors
// @desc    Create/register a new sensor (unique sensorId)
// @access  Admin
router.post('/sensors', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      sensorId: sensorIdBody,
      sensor_id,
      locationName: locationNameBody,
      location,
      latitude,
      longitude,
      mountHeight: mountHeightBody,
      mount_height,
      notes,
    } = req.body || {};

    const sensorId = (sensorIdBody || sensor_id || '').trim();
    const locationName = (locationNameBody || (typeof location === 'string' ? location : location?.name) || '').trim();
    const lat = Number(latitude ?? location?.lat);
    const lng = Number(longitude ?? location?.lng);
    const mountHeight = Number.isFinite(Number(mountHeightBody ?? mount_height)) ? Number(mountHeightBody ?? mount_height) : null;

    if (!sensorId) return res.status(400).json({ success: false, error: 'sensorId is required' });
    if (!locationName) return res.status(400).json({ success: false, error: 'locationName is required' });

    const existing = await Sensor.findOne({ sensorId });
    if (existing) return res.status(409).json({ success: false, error: 'Sensor ID already exists' });

    const created = await Sensor.create({
      sensorId,
      locationName,
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      mountHeight,
      notes: notes || null,
    });

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.SENSOR_CREATED,
      entityType: ADMIN_ENTITIES.SENSOR,
      entityId: created._id,
      entityLabel: `${created.sensorId}${created.locationName ? ` - ${created.locationName}` : ''}`,
      metadata: {
        sensorId: created.sensorId,
        locationName: created.locationName,
        latitude: created.latitude,
        longitude: created.longitude,
      },
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating sensor:', error);
    res.status(500).json({ success: false, error: 'Failed to create sensor' });
  }
});

// @route   GET /api/sensors/with-status
// @desc    List sensors with lastSeen, online/offline status, and latest distance
// @access  Public
router.get('/sensors/with-status', async (req, res) => {
  try {
    const sensors = await Sensor.find().sort({ createdAt: -1 }).lean();
    const now = Date.now();
    const results = await Promise.all(
      sensors.map(async (s) => {
        const last = await SensorData.findOne({ sensorId: s.sensorId }).sort({ timestamp: -1 }).lean();
        const lastSeen = last?.timestamp ? new Date(last.timestamp).toISOString() : null;
        const online = last?.timestamp ? (now - new Date(last.timestamp).getTime() < 2 * 60 * 1000) : false;
        const distance = last?.distance ?? null;
        const timestamp = last?.timestamp ?? null;
        
        return { 
          ...s, 
          lastSeen, 
          online, 
          distance,
          timestamp,
          // Include both formats for maximum compatibility
          location: {
            lat: s.latitude,
            lng: s.longitude
          },
          // Keep original fields too
          latitude: s.latitude,
          longitude: s.longitude
        };
      })
    );
    
    console.log(`📡 /api/sensors/with-status: Returning ${results.length} sensors`);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error fetching sensors with status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sensors with status' });
  }
});

// @route   PUT /api/sensors/:id
// @desc    Update sensor registry entry
// @access  Admin
router.put('/sensors/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { sensorId, locationName, latitude, longitude, mountHeight, notes } = req.body || {};

    const existing = await Sensor.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Sensor not found' });

    if (sensorId) {
      const dupe = await Sensor.findOne({ sensorId, _id: { $ne: id } });
      if (dupe) return res.status(409).json({ success: false, error: 'Sensor ID already exists' });
    }

    const before = {
      sensorId: existing.sensorId,
      locationName: existing.locationName,
      latitude: existing.latitude,
      longitude: existing.longitude,
      mountHeight: existing.mountHeight,
      notes: existing.notes,
    };

    if (sensorId != null) existing.sensorId = sensorId;
    if (locationName != null) existing.locationName = locationName;
    if (latitude != null) existing.latitude = Number(latitude);
    if (longitude != null) existing.longitude = Number(longitude);
    if (mountHeight != null) existing.mountHeight = Number(mountHeight);
    if (notes != null) existing.notes = notes;

    const saved = await existing.save();

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.SENSOR_UPDATED,
      entityType: ADMIN_ENTITIES.SENSOR,
      entityId: saved._id,
      entityLabel: `${saved.sensorId}${saved.locationName ? ` - ${saved.locationName}` : ''}`,
      changes: {
        sensorId: { from: before.sensorId, to: saved.sensorId },
        locationName: { from: before.locationName, to: saved.locationName },
        latitude: { from: before.latitude, to: saved.latitude },
        longitude: { from: before.longitude, to: saved.longitude },
        mountHeight: { from: before.mountHeight, to: saved.mountHeight },
        notes: { from: before.notes, to: saved.notes },
      },
    });

    res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error updating sensor:', error);
    res.status(500).json({ success: false, error: 'Failed to update sensor' });
  }
});

// @route   DELETE /api/sensors/:id
// @desc    Delete sensor registry entry
// @access  Admin
router.delete('/sensors/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Sensor.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, error: 'Sensor not found' });

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.SENSOR_DELETED,
      entityType: ADMIN_ENTITIES.SENSOR,
      entityId: removed._id,
      entityLabel: `${removed.sensorId}${removed.locationName ? ` - ${removed.locationName}` : ''}`,
      metadata: {
        sensorId: removed.sensorId,
        locationName: removed.locationName,
      },
    });

    res.json({ success: true, data: removed });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    res.status(500).json({ success: false, error: 'Failed to delete sensor' });
  }
});

export default router;
