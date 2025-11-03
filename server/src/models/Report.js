import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  barangay: {
    type: String,
    required: [true, 'Barangay is required'],
    trim: true,
    maxlength: [100, 'Barangay name cannot exceed 100 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Format: [longitude, latitude]'
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  depth: {
    type: String,
    enum: {
      values: ['Ankle', 'Knee', 'Waist', 'Chest'],
      message: 'Depth must be one of: Ankle, Knee, Waist, Chest'
    },
    required: [true, 'Flood depth is required']
  },
  passability: {
    type: String,
    enum: {
      values: ['Passable', 'HeavyOnly', 'NotPassable'],
      message: 'Passability must be one of: Passable, HeavyOnly, NotPassable'
    },
    required: [true, 'Road passability is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  photoUrl: {
    type: String,
    trim: true
  },
  photos: {
    type: [String],
    default: [],
    validate: {
      validator: function(photos) {
        return photos.length <= 3;
      },
      message: 'Cannot upload more than 3 photos'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['UNVERIFIED', 'VALIDATED', 'REJECTED'],
      message: 'Status must be one of: UNVERIFIED, VALIDATED, REJECTED'
    },
    default: 'UNVERIFIED'
  },
  validationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Validation notes cannot exceed 500 characters']
  },
  validatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  severity: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Severity must be one of: Low, Medium, High, Critical'
    },
    default: function() {
      // Auto-calculate severity based on depth and passability
      if (this.depth === 'Chest' || this.passability === 'NotPassable') {
        return 'Critical';
      } else if (this.depth === 'Waist' || this.passability === 'HeavyOnly') {
        return 'High';
      } else if (this.depth === 'Knee') {
        return 'Medium';
      } else {
        return 'Low';
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Geospatial index for location-based queries
ReportSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
ReportSchema.index({ barangay: 1, status: 1, createdAt: -1 });
ReportSchema.index({ reporter: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ severity: 1, createdAt: -1 });

// Pre-save middleware to calculate severity
ReportSchema.pre('save', function(next) {
  if (this.isModified('depth') || this.isModified('passability')) {
    if (this.depth === 'Chest' || this.passability === 'NotPassable') {
      this.severity = 'Critical';
    } else if (this.depth === 'Waist' || this.passability === 'HeavyOnly') {
      this.severity = 'High';
    } else if (this.depth === 'Knee') {
      this.severity = 'Medium';
    } else {
      this.severity = 'Low';
    }
  }
  next();
});

// Static method to find reports near a location
ReportSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to find reports by barangay
ReportSchema.statics.findByBarangay = function(barangay, status = null) {
  const query = { barangay, isActive: true };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get recent reports
ReportSchema.statics.getRecent = function(limit = 10, status = null) {
  const query = { isActive: true };
  if (status) query.status = status;
  return this.find(query)
    .populate('reporter', 'name email barangay')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to validate report
ReportSchema.methods.validateReport = function(validatorId, notes = '') {
  this.status = 'VALIDATED';
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
  this.validationNotes = notes;
  return this.save();
};

// Instance method to reject report
ReportSchema.methods.rejectReport = function(validatorId, notes = '') {
  this.status = 'REJECTED';
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
  this.validationNotes = notes;
  return this.save();
};

// Virtual for formatted location
ReportSchema.virtual('formattedLocation').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      longitude: this.location.coordinates[0],
      latitude: this.location.coordinates[1]
    };
  }
  return null;
});

// Virtual for age in hours
ReportSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

const Report = mongoose.model('Report', ReportSchema);

export default Report;
