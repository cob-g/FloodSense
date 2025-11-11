import mongoose from 'mongoose';

const SensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true, index: true },
  locationName: { type: String, required: true, index: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  mountHeight: { type: Number, default: null },
  notes: { type: String, default: null },
}, { timestamps: true });

SensorSchema.index({ sensorId: 1 }, { unique: true });

const Sensor = mongoose.model('Sensor', SensorSchema);
export default Sensor;
