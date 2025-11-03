import express from 'express';
import FallbackPlace from '../models/FallbackPlace.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimiting.js';

const router = express.Router();

// Apply general rate limiting to all fallback routes
router.use(generalRateLimit);

// Get all fallback places (public endpoint for offline mode)
router.get('/', async (req, res) => {
  try {
    const {
      barangay,
      category,
      limit = 50,
      skip = 0,
      lat,
      lng,
      radius = 10000 // 10km default for fallback places
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
      if (category) query.category = category;

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
    console.error('Get fallback places error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching fallback places.'
    });
  }
});

// Get single fallback place by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await FallbackPlace.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Fallback place not found.'
      });
    }

    res.json({
      success: true,
      data: { place }
    });

  } catch (error) {
    console.error('Get fallback place error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching fallback place.'
    });
  }
});

// Get evacuation centers
router.get('/category/evacuation-centers', async (req, res) => {
  try {
    const { barangay } = req.query;
    
    const centers = await FallbackPlace.getEvacuationCenters(barangay)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: { evacuationCenters: centers }
    });

  } catch (error) {
    console.error('Get evacuation centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching evacuation centers.'
    });
  }
});

// Get emergency facilities
router.get('/category/emergency-facilities', async (req, res) => {
  try {
    const { barangay } = req.query;
    
    const facilities = await FallbackPlace.getEmergencyFacilities(barangay)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: { emergencyFacilities: facilities }
    });

  } catch (error) {
    console.error('Get emergency facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching emergency facilities.'
    });
  }
});

// Get places by barangay
router.get('/barangay/:barangay', async (req, res) => {
  try {
    const { barangay } = req.params;
    const { category } = req.query;

    const places = await FallbackPlace.findByBarangay(barangay, category)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: {
        places,
        barangay,
        category: category || 'all'
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

// Create new fallback place (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      barangay,
      latitude,
      longitude,
      category,
      priority,
      notes,
      capacity,
      contactInfo,
      operatingHours
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
      category: category || 'landmark',
      priority: priority || 0,
      notes: notes?.trim() || '',
      capacity: capacity || null,
      contactInfo: contactInfo || {},
      operatingHours: operatingHours?.trim() || '',
      createdBy: req.user._id
    };

    const place = await FallbackPlace.create(placeData);
    
    // Populate creator info
    await place.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Fallback place created successfully.',
      data: { place }
    });

  } catch (error) {
    console.error('Create fallback place error:', error);
    
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
      message: 'Internal server error while creating fallback place.'
    });
  }
});

// Update fallback place (admin only)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      barangay,
      latitude,
      longitude,
      category,
      priority,
      notes,
      capacity,
      contactInfo,
      operatingHours
    } = req.body;

    const place = await FallbackPlace.findById(req.params.id);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Fallback place not found.'
      });
    }

    // Update fields
    if (name !== undefined) place.name = name.trim();
    if (barangay !== undefined) place.barangay = barangay.trim();
    if (category !== undefined) place.category = category;
    if (priority !== undefined) place.priority = priority;
    if (notes !== undefined) place.notes = notes.trim();
    if (capacity !== undefined) place.capacity = capacity;
    if (contactInfo !== undefined) place.contactInfo = contactInfo;
    if (operatingHours !== undefined) place.operatingHours = operatingHours.trim();

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

    res.json({
      success: true,
      message: 'Fallback place updated successfully.',
      data: { place }
    });

  } catch (error) {
    console.error('Update fallback place error:', error);
    
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
      message: 'Internal server error while updating fallback place.'
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
        message: 'Fallback place not found.'
      });
    }

    await place.updatePriority(priority);
    await place.populate('createdBy', 'name');

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

// Delete fallback place (soft delete - admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const place = await FallbackPlace.findById(req.params.id);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Fallback place not found.'
      });
    }

    // Soft delete
    place.isActive = false;
    await place.save();

    res.json({
      success: true,
      message: 'Fallback place deleted successfully.'
    });

  } catch (error) {
    console.error('Delete fallback place error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting fallback place.'
    });
  }
});

export default router;
