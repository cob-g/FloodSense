import express from 'express';
import SensorData from '../models/SensorData.js';
import { getIO } from '../socket.js';

const router = express.Router();

// @route   POST /api/sensor-data
// @desc    Receive sensor data from ESP32
// @access  Public (ESP32 device)
router.post('/sensor-data', async (req, res) => {
  try {
    const { distance } = req.body;
    
    // Validate distance
    if (typeof distance !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid distance. Must be a number.' 
      });
    }
    
    // Create new sensor reading
    const newData = new SensorData({ distance });
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

export default router;
