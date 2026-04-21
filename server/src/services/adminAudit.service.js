import AdminLog from '../models/AdminLog.js';

export const ADMIN_ACTIONS = {
  USER_STATUS_UPDATED: 'USER_STATUS_UPDATED',
  USER_ROLE_UPDATED: 'USER_ROLE_UPDATED',
  REPORT_VALIDATED: 'REPORT_VALIDATED',
  REPORT_REJECTED: 'REPORT_REJECTED',
  REPORT_DELETED: 'REPORT_DELETED',
  REPORTS_EXPORTED: 'REPORTS_EXPORTED',
  SENSOR_CREATED: 'SENSOR_CREATED',
  SENSOR_UPDATED: 'SENSOR_UPDATED',
  SENSOR_DELETED: 'SENSOR_DELETED',
  FALLBACK_CREATED: 'FALLBACK_CREATED',
  FALLBACK_UPDATED: 'FALLBACK_UPDATED',
  FALLBACK_PRIORITY_UPDATED: 'FALLBACK_PRIORITY_UPDATED',
  FALLBACK_DELETED: 'FALLBACK_DELETED',
  WEEKLY_REPORT_EXPORTED: 'WEEKLY_REPORT_EXPORTED',
};

export const ADMIN_ENTITIES = {
  USER: 'USER',
  REPORT: 'REPORT',
  SENSOR: 'SENSOR',
  FALLBACK: 'FALLBACK',
  ANALYTICS: 'ANALYTICS',
};

const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 20;
const MAX_STRING_LENGTH = 1000;

const truncate = (value, maxLength = MAX_STRING_LENGTH) => {
  if (typeof value !== 'string') return value;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

const sanitizeValue = (value, depth = 0) => {
  if (value == null) return value;

  if (typeof value === 'string') return truncate(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();

  if (depth >= MAX_DEPTH) {
    return '[Truncated]';
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const output = {};
    for (const [key, val] of Object.entries(value)) {
      output[key] = sanitizeValue(val, depth + 1);
    }
    return output;
  }

  return String(value);
};

const extractIpAddress = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return req?.ip || req?.socket?.remoteAddress || null;
};

export const writeAdminLog = async ({
  req,
  user,
  action,
  entityType,
  entityId = null,
  entityLabel = null,
  status = 'SUCCESS',
  notes = null,
  changes = null,
  metadata = null,
}) => {
  if (!user?._id || !action || !entityType) {
    return null;
  }

  try {
    return await AdminLog.create({
      actorId: user._id,
      actorName: user.name || null,
      actorEmail: user.email || null,
      action,
      entityType,
      entityId: entityId != null ? String(entityId) : null,
      entityLabel: entityLabel != null ? truncate(String(entityLabel), 200) : null,
      status,
      notes: notes != null ? truncate(String(notes)) : null,
      changes: sanitizeValue(changes),
      metadata: sanitizeValue(metadata),
      ipAddress: extractIpAddress(req),
      userAgent: truncate(req?.get?.('user-agent') || req?.headers?.['user-agent'] || null, 500),
      performedAt: new Date(),
    });
  } catch (error) {
    console.error('Admin audit log write failed:', error);
    return null;
  }
};

export default writeAdminLog;
