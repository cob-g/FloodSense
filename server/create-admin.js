// Quick script to create and verify admin user
import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/floodsense');
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@floodsense.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { role: 'superadmin' }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);
      return;
    }

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed by middleware
      role: 'superadmin',
      barangay: null
    };

    const admin = await User.create(adminData);
    console.log('✅ Superadmin user created:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);

    // Verify password comparison works
    const isValidPassword = await admin.comparePassword(adminPassword);
    console.log(`   Password verification: ${isValidPassword ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
  }
};

createAdminUser();
