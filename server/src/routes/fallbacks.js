import express from 'express';
import FallbackPlace, { HISTORICAL_FALLBACK_CATEGORY } from '../models/FallbackPlace.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimiting.js';
import { writeAdminLog, ADMIN_ACTIONS, ADMIN_ENTITIES } from '../services/adminAudit.service.js';

const router = express.Router();

// Apply general rate limiting to all fallback routes
router.use(generalRateLimit);

// Get all historical flood spots (public endpoint for offline mode)
router.get('/', async (req, res) => {
  try {
    const {
      barangay,
      limit = 50,
      skip = 0,
      lat,
      lng,
      radius = 10000 // 10km default radius
    } = req.query;

    let places;

    // Location-based search if coordinates provided
    if (lat && lng) {
      places = await FallbackPlace.findNearby(
        parseFloat(lng), 
        parseFloat(lat), 
        parseInt(radius)
      )
        .populate('createdBy', 'name')
        .limit(parseInt(limit))
        .skip(parseInt(skip));
    } else {
      // Build query for regular search
      const query = { isActive: true };
      
      if (barangay) query.barangay = new RegExp(barangay, 'i');

      places = await FallbackPlace.find(query)
        .populate('createdBy', 'name')
        .sort({ priority: -1, barangay: 1, name: 1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
    }

    // Get total count for pagination
    const total = await FallbackPlace.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        places,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Get historical flood spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching historical flood spots.'
    });
  }
});

// Get single historical flood spot by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await FallbackPlace.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Historical flood spot not found.'
      });
    }

    res.json({
      success: true,
      data: { place }
    });

  } catch (error) {
    console.error('Get historical flood spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching historical flood spot.'
    });
  }
});

// Get historical flood spots
router.get('/category/historical-flood-spots', async (req, res) => {
  try {
    const { barangay } = req.query;
    
    const places = await FallbackPlace.getHistoricalFloodSpots(barangay)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: { places }
    });

  } catch (error) {
    console.error('Get historical flood spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching historical flood spots.'
    });
  }
});

// Get places by barangay
router.get('/barangay/:barangay', async (req, res) => {
  try {
    const { barangay } = req.params;

    const places = await FallbackPlace.findByBarangay(barangay)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: {
        places,
        barangay,
        category: HISTORICAL_FALLBACK_CATEGORY,
      }
    });

  } catch (error) {
    console.error('Get barangay places error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching barangay places.'
    });
  }
});

// Create new historical flood spot (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      barangay,
      latitude,
      longitude,
      priority,
      notes
    } = req.body;

    // Validation
    if (!name || !barangay || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Name, barangay, and location coordinates are required.'
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided.'
      });
    }

    // Create place data
    const placeData = {
      name: name.trim(),
      barangay: barangay.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat] // [longitude, latitude] for GeoJSON
      },
      category: HISTORICAL_FALLBACK_CATEGORY,
      priority: priority || 0,
      notes: notes?.trim() || '',
      createdBy: req.user._id
    };

    const place = await FallbackPlace.create(placeData);
    
    // Populate creator info
    await place.populate('createdBy', 'name');

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.FALLBACK_CREATED,
      entityType: ADMIN_ENTITIES.FALLBACK,
      entityId: place._id,
      entityLabel: `${place.name}${place.barangay ? ` - ${place.barangay}` : ''}`,
      metadata: {
        name: place.name,
        barangay: place.barangay,
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: place.priority,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Historical flood spot created successfully.',
      data: { place }
    });

  } catch (error) {
    console.error('Create historical flood spot error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating historical flood spot.'
    });
  }
});

// Update historical flood spot (admin only)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      barangay,
      latitude,
      longitude,
      priority,
      notes
    } = req.body;

    const place = await FallbackPlace.findById(req.params.id);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Historical flood spot not found.'
      });
    }

    const before = {
      name: place.name,
      barangay: place.barangay,
      priority: place.priority,
      notes: place.notes,
      location: place.location?.coordinates || null,
    };

    // Update fields
    if (name !== undefined) place.name = name.trim();
    if (barangay !== undefined) place.barangay = barangay.trim();
    place.category = HISTORICAL_FALLBACK_CATEGORY;
    if (priority !== undefined) place.priority = priority;
    if (notes !== undefined) place.notes = notes.trim();

    // Update location if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided.'
        });
      }

      place.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }

    await place.save();
    await place.populate('createdBy', 'name');

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.FALLBACK_UPDATED,
      entityType: ADMIN_ENTITIES.FALLBACK,
      entityId: place._id,
      entityLabel: `${place.name}${place.barangay ? ` - ${place.barangay}` : ''}`,
      changes: {
        name: { from: before.name, to: place.name },
        barangay: { from: before.barangay, to: place.barangay },
        priority: { from: before.priority, to: place.priority },
        notes: { from: before.notes, to: place.notes },
        location: { from: before.location, to: place.location?.coordinates || null },
      },
    });

    res.json({
      success: true,
      message: 'Historical flood spot updated successfully.',
      data: { place }
    });

  } catch (error) {
    console.error('Update historical flood spot error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating historical flood spot.'
    });
  }
});

// Update place priority (admin only)
router.patch('/:id/priority', authenticate, requireAdmin, async (req, res) => {
  try {
    const { priority } = req.body;

    if (priority === undefined || isNaN(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Valid priority value is required.'
      });
    }

    const place = await FallbackPlace.findById(req.params.id);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Historical flood spot not found.'
      });
    }

    const previousPriority = place.priority;
    await place.updatePriority(priority);
    await place.populate('createdBy', 'name');

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.FALLBACK_PRIORITY_UPDATED,
      entityType: ADMIN_ENTITIES.FALLBACK,
      entityId: place._id,
      entityLabel: `${place.name}${place.barangay ? ` - ${place.barangay}` : ''}`,
      changes: {
        priority: {
          from: previousPriority,
          to: place.priority,
        },
      },
    });

    res.json({
      success: true,
      message: 'Priority updated successfully.',
      data: { place }
    });

  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating priority.'
    });
  }
});

// Delete historical flood spot (soft delete - admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const place = await FallbackPlace.findById(req.params.id);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Historical flood spot not found.'
      });
    }

    // Soft delete
    const previousIsActive = place.isActive;
    place.isActive = false;
    await place.save();

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.FALLBACK_DELETED,
      entityType: ADMIN_ENTITIES.FALLBACK,
      entityId: place._id,
      entityLabel: `${place.name}${place.barangay ? ` - ${place.barangay}` : ''}`,
      changes: {
        isActive: {
          from: previousIsActive,
          to: place.isActive,
        },
      },
      metadata: {
        barangay: place.barangay,
      },
    });

    res.json({
      success: true,
      message: 'Historical flood spot deleted successfully.'
    });

  } catch (error) {
    console.error('Delete historical flood spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting historical flood spot.'
    });
  }
});

export default router;
