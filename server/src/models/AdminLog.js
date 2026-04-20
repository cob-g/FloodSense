import mongoose from 'mongoose';

const { Schema } = mongoose;

const ADMIN_LOG_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const AdminLogSchema = new Schema({
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actorName: {
    type: String,
    trim: true,
    maxlength: [120, 'Actor name cannot exceed 120 characters'],
  },
  actorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Actor email cannot exceed 255 characters'],
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [80, 'Action cannot exceed 80 characters'],
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    trim: true,
    maxlength: [50, 'Entity type cannot exceed 50 characters'],
  },
  entityId: {
    type: String,
    trim: true,
    maxlength: [100, 'Entity ID cannot exceed 100 characters'],
    default: null,
  },
  entityLabel: {
    type: String,
    trim: true,
    maxlength: [200, 'Entity label cannot exceed 200 characters'],
    default: null,
  },
  status: {
    type: String,
    enum: {
      values: ['SUCCESS', 'FAILED'],
      message: 'Status must be SUCCESS or FAILED',
    },
    default: 'SUCCESS',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: null,
  },
  changes: {
    type: Schema.Types.Mixed,
    default: null,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    trim: true,
    maxlength: [80, 'IP address cannot exceed 80 characters'],
    default: null,
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters'],
    default: null,
  },
  performedAt: {
    type: Date,
    default: Date.now,
  },
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

AdminLogSchema.index({ actorId: 1, performedAt: -1 });
AdminLogSchema.index({ action: 1, performedAt: -1 });
AdminLogSchema.index({ entityType: 1, performedAt: -1 });
AdminLogSchema.index({ entityType: 1, entityId: 1, performedAt: -1 });
AdminLogSchema.index({ status: 1, performedAt: -1 });
AdminLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: ADMIN_LOG_RETENTION_SECONDS });

const AdminLog = mongoose.model('AdminLog', AdminLogSchema);

export default AdminLog;
