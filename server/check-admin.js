// Direct database check and admin creation
import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAndCreateAdmin = async () => {
  try {
    console.log('🔍 Checking database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/floodsense');
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@floodsense.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log(`🔍 Looking for admin user: ${adminEmail}`);

    // Check existing users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    console.log(`👑 Admin users found: ${adminUsers.length}`);

    // Check if our specific admin exists
    const existingAdmin = await User.findByEmail(adminEmail);

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);

      // Test password
      const isValidPassword = await existingAdmin.comparePassword(adminPassword);
      console.log(`   Password valid: ${isValidPassword ? '✅' : '❌'}`);

    } else {
      console.log('❌ Admin user not found. Creating...');

      const adminData = {
        name: 'System Administrator',
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'superadmin',
        barangay: null
      };

      const newAdmin = await User.create(adminData);
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   ID: ${newAdmin._id}`);

      // Test the password
      const isValidPassword = await newAdmin.comparePassword(adminPassword);
      console.log(`   Password verification: ${isValidPassword ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB might not be running. Try starting it with:');
      console.log('   mongod --dbpath C:\\data\\db');
    }
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
};

checkAndCreateAdmin();
