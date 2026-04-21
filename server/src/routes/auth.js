import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { generateToken } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimiting.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

const router = express.Router();
const PASSWORD_RESET_EXPIRY_MINUTES = parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES, 10) || 60;
const PASSWORD_RESET_GENERIC_MESSAGE = 'If an account with that email exists, a password reset link has been sent.';

const normalizeBaseUrl = (url) => (url || '').trim().replace(/\/+$/, '');

const resolveDevelopmentClientUrl = (req) => {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const origin = req.get('origin');
  if (!origin) {
    return null;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isLocalhost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
    const allowedDevPorts = new Set(['5173', '5174', '5175', '5176', '3000', '3001']);

    if (!isLocalhost || !allowedDevPorts.has(parsedOrigin.port)) {
      return null;
    }

    return `${normalizeBaseUrl(parsedOrigin.origin)}/auth/reset-password`;
  } catch {
    return null;
  }
};

const buildPasswordResetUrl = (token, req) => {
  const configuredResetUrl = normalizeBaseUrl(process.env.PASSWORD_RESET_URL);
  const devClientUrl = resolveDevelopmentClientUrl(req);
  const fallbackClientUrl = normalizeBaseUrl(process.env.CLIENT_URL || 'http://localhost:5173');

  const baseUrl = configuredResetUrl
    || devClientUrl
    || `${fallbackClientUrl}/auth/reset-password`;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
};

// Register new user (with rate limiting)
router.post('/register', generalRateLimit, async (req, res) => {
  try {
    const { name, email, password, barangay } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // Will be hashed by the pre-save middleware
      barangay: barangay?.trim() || null
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please sign in.',
      data: {
        user: user.profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
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
      message: 'Internal server error during registration.'
    });
  }
});

// Login user (with rate limiting)
router.post('/login', generalRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.profile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
});

// Forgot password (with anti-enumeration response)
router.post('/forgot-password', generalRateLimit, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  try {
    const user = await User.findByEmail(normalizedEmail);

    if (user?.isActive) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

      // Keep only one active token per user to limit abuse.
      await PasswordResetToken.deleteMany({ userId: user._id, usedAt: null });
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt
      });

      const resetUrl = buildPasswordResetUrl(rawToken, req);

      try {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetUrl,
          expiresMinutes: PASSWORD_RESET_EXPIRY_MINUTES
        });
      } catch (emailError) {
        console.error('Password reset email send error:', emailError);
      }
    }

    return res.json({
      success: true,
      message: PASSWORD_RESET_GENERIC_MESSAGE
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request.'
    });
  }
});

// Reset password using one-time token
router.post('/reset-password', generalRateLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const normalizedToken = typeof token === 'string' ? token.trim() : '';

    if (!normalizedToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(normalizedToken).digest('hex');
    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or expired. Please request a new one.'
      });
    }

    const user = await User.findById(resetToken.userId);
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or expired. Please request a new one.'
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    const usedAt = new Date();
    await PasswordResetToken.updateMany(
      { userId: user._id, usedAt: null },
      { $set: { usedAt } }
    );

    return res.json({
      success: true,
      message: 'Password reset successful. You can now sign in.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while resetting password.'
    });
  }
});

// Logout user (no rate limiting needed)
router.post('/logout', (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.'
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile.'
    });
  }
});

// Update user profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { name, barangay } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name !== undefined) {
      user.name = name.trim();
    }
    
    if (barangay !== undefined) {
      user.barangay = barangay?.trim() || null;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
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
      message: 'Internal server error while updating profile.'
    });
  }
});

// Change password (with rate limiting)
router.patch('/change-password', authenticate, generalRateLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password.'
    });
  }
});

export default router;
