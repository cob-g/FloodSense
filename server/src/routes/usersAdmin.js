import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AdminLog from '../models/AdminLog.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { writeAdminLog, ADMIN_ACTIONS, ADMIN_ENTITIES } from '../services/adminAudit.service.js';

const router = express.Router();

const startOfDay = (dateLike) => {
  const dt = new Date(dateLike);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const endOfDay = (dateLike) => {
  const dt = new Date(dateLike);
  dt.setHours(23, 59, 59, 999);
  return dt;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ALLOWED_USER_SORT_FIELDS = new Set([
  'createdAt',
  'lastLogin',
  'name',
  'email',
  'role',
  'isActive',
]);

// All routes here require admin
router.use(authenticate, requireAdmin);

// GET /api/admin/users
// Query: limit, skip, q (search by name/email), sortBy, sortOrder
router.get('/users', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const q = (req.query.q || '').trim();
    const sortByRaw = String(req.query.sortBy || 'createdAt').trim();
    const sortOrderRaw = String(req.query.sortOrder || 'desc').trim().toLowerCase();
    const sortBy = ALLOWED_USER_SORT_FIELDS.has(sortByRaw) ? sortByRaw : 'createdAt';
    const sortOrder = sortOrderRaw === 'asc' ? 1 : -1;
    const sort = {
      [sortBy]: sortOrder,
      _id: sortOrder,
    };

    const find = {};
    if (q) {
      find.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [users, total, activeCount, adminCount, deactivatedCount, last7DaysCount] = await Promise.all([
      User.find(find).sort(sort).skip(skip).limit(limit).select('-passwordHash').lean(),
      User.countDocuments(find),
      User.countDocuments({ ...find, isActive: true }),
      User.countDocuments({ ...find, role: { $in: ['admin', 'superadmin'] } }),
      User.countDocuments({ ...find, isActive: false }),
      (async () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return User.countDocuments({ ...find, createdAt: { $gte: sevenDaysAgo } });
      })(),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          barangay: u.barangay,
          isActive: u.isActive,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
        })),
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
          sortBy,
          sortOrder: sortOrder === 1 ? 'asc' : 'desc',
        },
        counts: {
          total,
          active: activeCount,
          admins: adminCount,
          deactivated: deactivatedCount,
          newLast7Days: last7DaysCount,
          byRole: {
            user: await User.countDocuments({ ...find, role: 'user' }),
            admin: await User.countDocuments({ ...find, role: 'admin' }),
            superadmin: await User.countDocuments({ ...find, role: 'superadmin' }),
          },
        },
      },
    });
  } catch (err) {
    console.error('List users failed:', err);
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
});

// GET /api/admin/activity-logs
// Query: actor, action, entityType, entityId, status, dateFrom, dateTo, limit, skip
router.get('/activity-logs', requireSuperAdmin, async (req, res) => {
  try {
    const {
      actor,
      action,
      entityType,
      entityId,
      status,
      dateFrom,
      dateTo,
      limit = 25,
      skip = 0,
    } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);
    const parsedSkip = Math.max(parseInt(skip, 10) || 0, 0);

    const query = {};

    if (actor) {
      const actorQuery = String(actor).trim();
      if (mongoose.Types.ObjectId.isValid(actorQuery)) {
        query.actorId = actorQuery;
      } else {
        const safe = escapeRegex(actorQuery);
        query.$or = [
          { actorName: { $regex: safe, $options: 'i' } },
          { actorEmail: { $regex: safe, $options: 'i' } },
        ];
      }
    }

    if (action) {
      query.action = String(action).trim().toUpperCase();
    }

    if (entityType) {
      query.entityType = String(entityType).trim().toUpperCase();
    }

    if (entityId) {
      query.entityId = String(entityId).trim();
    }

    if (status) {
      query.status = String(status).trim().toUpperCase();
    }

    if (dateFrom || dateTo) {
      query.performedAt = {};

      if (dateFrom) {
        const parsedFrom = new Date(String(dateFrom));
        if (Number.isNaN(parsedFrom.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid dateFrom value.' });
        }
        query.performedAt.$gte = startOfDay(parsedFrom);
      }

      if (dateTo) {
        const parsedTo = new Date(String(dateTo));
        if (Number.isNaN(parsedTo.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid dateTo value.' });
        }
        query.performedAt.$lte = endOfDay(parsedTo);
      }

      if (query.performedAt.$gte && query.performedAt.$lte && query.performedAt.$gte > query.performedAt.$lte) {
        return res.status(400).json({ success: false, message: 'dateFrom must be before or equal to dateTo.' });
      }
    }

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .sort({ performedAt: -1, _id: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .populate('actorId', 'name email role')
        .lean(),
      AdminLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log._id,
          timestamp: log.performedAt || log.createdAt,
          actorId: log.actorId?._id || log.actorId || null,
          actorName: log.actorId?.name || log.actorName || null,
          actorEmail: log.actorId?.email || log.actorEmail || null,
          actorRole: log.actorId?.role || null,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          entityLabel: log.entityLabel,
          status: log.status,
          notes: log.notes,
          changes: log.changes,
          metadata: log.metadata,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
        })),
        pagination: {
          total,
          limit: parsedLimit,
          skip: parsedSkip,
          hasMore: parsedSkip + parsedLimit < total,
        },
      },
    });
  } catch (err) {
    console.error('List activity logs failed:', err);
    res.status(500).json({ success: false, message: 'Failed to load activity logs' });
  }
});

// PATCH /api/admin/users/:id/status  { isActive: boolean }
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be boolean' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Admins can only toggle status for regular users
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Admins can only modify status of regular users.' });
    }

    // Prevent deactivating the last active superadmin
    if (target.role === 'superadmin' && isActive === false) {
      const others = await User.countDocuments({ role: 'superadmin', isActive: true, _id: { $ne: target._id } });
      if (others === 0) {
        return res.status(400).json({ success: false, message: 'Cannot deactivate the last active superadmin.' });
      }
    }

    const previousIsActive = target.isActive;
    target.isActive = isActive;
    await target.save();

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.USER_STATUS_UPDATED,
      entityType: ADMIN_ENTITIES.USER,
      entityId: target._id,
      entityLabel: target.email || target.name || String(target._id),
      changes: {
        isActive: {
          from: previousIsActive,
          to: target.isActive,
        },
      },
      metadata: {
        targetRole: target.role,
      },
    });

    res.json({ success: true, data: { id: target._id, isActive: target.isActive } });
  } catch (err) {
    console.error('Update user status failed:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// PATCH /api/admin/users/:id/role  { role: 'user'|'admin'|'superadmin' }
router.patch('/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent removing the last superadmin
    if (target.role === 'superadmin' && role !== 'superadmin') {
      const others = await User.countDocuments({ role: 'superadmin', isActive: true, _id: { $ne: target._id } });
      if (others === 0) {
        return res.status(400).json({ success: false, message: 'Cannot remove the last superadmin.' });
      }
    }

    const previousRole = target.role;
    target.role = role;
    await target.save();

    await writeAdminLog({
      req,
      user: req.user,
      action: ADMIN_ACTIONS.USER_ROLE_UPDATED,
      entityType: ADMIN_ENTITIES.USER,
      entityId: target._id,
      entityLabel: target.email || target.name || String(target._id),
      changes: {
        role: {
          from: previousRole,
          to: target.role,
        },
      },
      metadata: {
        active: target.isActive,
      },
    });

    res.json({ success: true, data: { id: target._id, role: target.role } });
  } catch (err) {
    console.error('Update user role failed:', err);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

export default router;
