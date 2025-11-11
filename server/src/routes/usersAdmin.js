import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes here require admin
router.use(authenticate, requireAdmin);

// GET /api/admin/users
// Query: limit, skip, q (search by name/email)
router.get('/users', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = parseInt(req.query.skip) || 0;
    const q = (req.query.q || '').trim();

    const find = {};
    if (q) {
      find.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [users, total, activeCount, adminCount, deactivatedCount, last7DaysCount] = await Promise.all([
      User.find(find).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash').lean(),
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
        pagination: { total, limit, skip, hasMore: skip + limit < total },
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

    target.isActive = isActive;
    await target.save();
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

    target.role = role;
    await target.save();
    res.json({ success: true, data: { id: target._id, role: target.role } });
  } catch (err) {
    console.error('Update user role failed:', err);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

export default router;
