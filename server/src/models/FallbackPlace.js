import mongoose from 'mongoose';

const { Schema } = mongoose;

const FallbackPlaceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
    maxlength: [200, 'Place name cannot exceed 200 characters']
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
    }
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative'],
    max: [100, 'Priority cannot exceed 100']
  },
  category: {
    type: String,
    enum: {
      values: ['evacuation_center', 'hospital', 'school', 'government', 'landmark', 'bridge', 'road', 'other'],
      message: 'Category must be one of: evacuation_center, hospital, school, government, landmark, bridge, road, other'
    },
    default: 'landmark'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  capacity: {
    type: Number,
    default: null,
    min: [0, 'Capacity cannot be negative']
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  operatingHours: {
    type: String,
    trim: true,
    maxlength: [100, 'Operating hours cannot exceed 100 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  updatedAt: {
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
FallbackPlaceSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
FallbackPlaceSchema.index({ barangay: 1, category: 1, priority: -1 });
FallbackPlaceSchema.index({ category: 1, isActive: 1, priority: -1 });
FallbackPlaceSchema.index({ priority: -1, updatedAt: -1 });

// Pre-save middleware to update the updatedAt field
FallbackPlaceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find places near a location
FallbackPlaceSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
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
  }).sort({ priority: -1 });
};

// Static method to find places by barangay
FallbackPlaceSchema.statics.findByBarangay = function(barangay, category = null) {
  const query = { barangay, isActive: true };
  if (category) query.category = category;
  return this.find(query).sort({ priority: -1, name: 1 });
};

// Static method to get evacuation centers
FallbackPlaceSchema.statics.getEvacuationCenters = function(barangay = null) {
  const query = { category: 'evacuation_center', isActive: true };
  if (barangay) query.barangay = barangay;
  return this.find(query).sort({ priority: -1, capacity: -1 });
};

// Static method to get emergency facilities
FallbackPlaceSchema.statics.getEmergencyFacilities = function(barangay = null) {
  const query = { 
    category: { $in: ['hospital', 'government', 'evacuation_center'] }, 
    isActive: true 
  };
  if (barangay) query.barangay = barangay;
  return this.find(query).sort({ priority: -1, category: 1 });
};

// Static method to get all active places sorted by priority
FallbackPlaceSchema.statics.getAllSorted = function() {
  return this.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ priority: -1, barangay: 1, name: 1 });
};

// Instance method to update priority
FallbackPlaceSchema.methods.updatePriority = function(newPriority) {
  this.priority = Math.max(0, Math.min(100, newPriority));
  return this.save();
};

// Virtual for formatted location
FallbackPlaceSchema.virtual('formattedLocation').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      longitude: this.location.coordinates[0],
      latitude: this.location.coordinates[1]
    };
  }
  return null;
});

// Virtual for display name with barangay
FallbackPlaceSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.barangay})`;
});

// Virtual for category display name
FallbackPlaceSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'evacuation_center': 'Evacuation Center',
    'hospital': 'Hospital',
    'school': 'School',
    'government': 'Government Office',
    'landmark': 'Landmark',
    'bridge': 'Bridge',
    'road': 'Road',
    'other': 'Other'
  };
  return categoryMap[this.category] || this.category;
});

const FallbackPlace = mongoose.model('FallbackPlace', FallbackPlaceSchema);

export default FallbackPlace;
