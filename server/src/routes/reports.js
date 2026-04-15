import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Report from '../models/Report.js';
import { authenticate, requireAdmin, requireOwnershipOrAdmin } from '../middleware/auth.js';
import { reportRateLimit, generalRateLimit } from '../middleware/rateLimiting.js';
import { getIO } from '../socket.js';

const router = express.Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Apply general rate limiting to all report routes
router.use(generalRateLimit);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Submit a new report
router.post('/', authenticate, reportRateLimit, upload.array('photos', 3), async (req, res) => {
  console.log('Incoming report submission:');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  try {
    const {
      depth,
      passability,
      description = '',
      latitude,
      longitude,
      address,
      barangay
    } = req.body;

    // Validate required fields
    if (!depth || !passability || !latitude || !longitude || !address || !barangay) {
      // Clean up uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting uploaded file:', err);
          });
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // Create report data
    const reportData = {
      reporter: req.user._id,
      depth, // Use as string
      passability,
      description: description.trim(),
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address
      },
      barangay, // Top-level field
      photos: []
    };

    // Add photo URLs if uploaded
    if (req.files && req.files.length > 0) {
      reportData.photos = req.files.map(file => file.filename);
    }

    const report = await Report.create(reportData);
    await report.populate('reporter', 'name barangay');

    // Emit real-time update to barangay subscribers
    const io = getIO();
    io.to(`barangay-${barangay}`).emit('new-report', {
      report: report.toJSON(),
      message: `New flood report in ${barangay}`
    });

    // Also emit to all connected clients for general updates
    io.emit('report-update', {
      type: 'new',
      report: report.toJSON()
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: { report }
    });

  } catch (error) {
    console.error('Create report error:', error);
    
    // Clean up uploaded files if report creation failed
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      });
    }

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
      message: 'Internal server error while creating report.'
    });
  }
});

// Get reports with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      status,
      severity,
      scope,
      start,
      end,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      photos,
      lng,
      lat,
      radius = 5000 // 5km default
    } = req.query;

    // Build query
    const query = {
      isActive: true,
      ...(status && { status }),
      ...(severity && { severity }),
      ...(photos === 'true' && { 'photos.0': { $exists: true } }),
    };

    // Optional additive date filtering for admin/report scope use-cases.
    // Backward-compatible default: no date filter unless start/end are provided
    // or scope=weekly is explicitly requested.
    const normalizedScope = String(scope || '').toLowerCase();
    const shouldApplyDateRange = Boolean(start || end || normalizedScope === 'weekly');

    if (shouldApplyDateRange) {
      const now = new Date();

      let parsedStart = null;
      let parsedEnd = null;

      if (start) {
        parsedStart = new Date(start);
        if (Number.isNaN(parsedStart.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date. Use a valid date format (e.g., YYYY-MM-DD).'
          });
        }
      }

      if (end) {
        parsedEnd = new Date(end);
        if (Number.isNaN(parsedEnd.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date. Use a valid date format (e.g., YYYY-MM-DD).'
          });
        }
      }

      const resolvedEnd = parsedEnd ? endOfDay(parsedEnd) : endOfDay(now);
      const resolvedStart = parsedStart
        ? startOfDay(parsedStart)
        : startOfDay(new Date(resolvedEnd.getTime() - 6 * 24 * 60 * 60 * 1000));

      if (resolvedStart > resolvedEnd) {
        return res.status(400).json({
          success: false,
          message: 'start date must be before or equal to end date.'
        });
      }

      query.createdAt = { $gte: resolvedStart, $lte: resolvedEnd };
    }

    // Add geospatial query if coordinates are provided
    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Execute query with pagination
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await Report.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('reporter', 'name')
      .populate('validatedBy', 'name');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching reports.'
    });
  }
});

// Validate report (admin only)
router.patch('/:id/validate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report || !report.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    if (report.status !== 'UNVERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Only unverified reports can be validated.'
      });
    }

    await report.validateReport(req.user._id, notes || '');
    await report.populate(['reporter', 'validatedBy']);

    // Emit real-time update
    const io = getIO();
    
    // Emit to barangay room
    io.to(`barangay-${report.barangay}`).emit('report-validated', {
      report: report.toJSON(),
      message: `Report validated in ${report.barangay}`
    });
    
    // Also emit globally so all users see the update
    io.emit('report-update', {
      type: 'validated',
      report: report.toJSON()
    });

    res.json({
      success: true,
      message: 'Report validated successfully.',
      data: { report }
    });

  } catch (error) {
    console.error('Validate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating report.'
    });
  }
});

// Reject report (admin only)
// Reject report (admin only)
router.patch('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection notes are required.'
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report || !report.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    if (report.status !== 'UNVERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Only unverified reports can be rejected.'
      });
    }

    await report.rejectReport(req.user._id, notes.trim());
    await report.populate(['reporter', 'validatedBy']);

    // Emit real-time update
    const io = getIO();
    
    // Emit to barangay room
    io.to(`barangay-${report.barangay}`).emit('report-rejected', {
      report: report.toJSON(),
      message: `Report rejected in ${report.barangay}`
    });
    
    // Also emit globally so all users see the update
    io.emit('report-update', {
      type: 'rejected',
      report: report.toJSON()
    });

    res.json({
      success: true,
      message: 'Report rejected successfully.',
      data: { report }
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting report.'
    });
  }
});

// Update report (owner or admin only)
router.patch('/:id', authenticate, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { description } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report || !report.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    // Check ownership if not admin
    if (req.requireOwnership && !report.reporter.equals(req.requireOwnership.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own reports.'
      });
    }

    // Only allow editing description for now
    if (description !== undefined) {
      report.description = description.trim();
    }

    await report.save();
    await report.populate(['reporter', 'validatedBy']);

    // Emit real-time update
    const io = getIO();
    io.to(`barangay-${report.barangay}`).emit('report-updated', {
      report: report.toJSON(),
      message: `Report updated in ${report.barangay}`
    });

    res.json({
      success: true,
      message: 'Report updated successfully.',
      data: { report }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating report.'
    });
  }
});


// Delete report (soft delete - admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    // Soft delete
    report.isActive = false;
    await report.save();

    // Emit real-time update
    const io = getIO();
    io.to(`barangay-${report.barangay}`).emit('report-deleted', {
      reportId: report._id,
      message: `Report deleted in ${report.barangay}`
    });

    res.json({
      success: true,
      message: 'Report deleted successfully.'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting report.'
    });
  }
});

// Get reports by barangay
router.get('/barangay/:barangay', async (req, res) => {
  try {
    const { barangay } = req.params;
    const { status, limit = 20, skip = 0 } = req.query;

    const reports = await Report.findByBarangay(barangay, status)
      .populate('reporter', 'name')
      .populate('validatedBy', 'name')
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Report.countDocuments({
      barangay: new RegExp(barangay, 'i'),
      isActive: true,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        reports,
        barangay,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Get barangay reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching barangay reports.'
    });
  }
});

export default router;
