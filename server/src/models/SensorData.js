import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    index: true,
    default: null
  },
  locationName: {
    type: String,
    default: null,
    index: true
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by timestamp
SensorDataSchema.index({ timestamp: -1 });
SensorDataSchema.index({ sensorId: 1, timestamp: -1 });

// Virtual for formatted timestamp
SensorDataSchema.virtual('formattedTime').get(function() {
  return this.timestamp.toLocaleString();
});

// Ensure virtuals are included in JSON
SensorDataSchema.set('toJSON', { virtuals: true });
SensorDataSchema.set('toObject', { virtuals: true });

const SensorData = mongoose.model('SensorData', SensorDataSchema);

export default SensorData;
