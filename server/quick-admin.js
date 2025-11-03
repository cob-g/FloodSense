import express from 'express';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Test route to create admin
app.post('/create-admin', async (req, res) => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/floodsense');

    const adminData = {
      name: 'System Administrator',
      email: 'admin@floodsense.local',
      passwordHash: 'admin123',
      role: 'superadmin',
      barangay: null
    };

    const admin = await User.create(adminData);
    console.log('✅ Admin created:', admin.email);

    res.json({ success: true, admin: admin.profile });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5001, () => {
  console.log('🚀 Admin creation server on port 5001');
  console.log('📍 POST http://localhost:5001/create-admin');
});
