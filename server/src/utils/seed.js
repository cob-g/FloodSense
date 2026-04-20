import User from '../models/User.js';
import FallbackPlace, { HISTORICAL_FALLBACK_CATEGORY } from '../models/FallbackPlace.js';

// Seed admin user
export const seedAdmin = async () => {
  try {
    console.log('🌱 Checking for admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@floodsense.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminEmail },
        { role: 'superadmin' }
      ]
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }
    
    // Create superadmin user
    const adminData = {
      name: 'System Administrator',
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed by pre-save middleware
      role: 'superadmin',
      barangay: null
    };
    
    const admin = await User.create(adminData);
    console.log('✅ Superadmin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Please change the default password after first login!');
    
    return admin;
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

// Seed sample historical flood spots
export const seedFallbackPlaces = async () => {
  try {
    console.log('🌱 Seeding sample historical flood spots...');
    
    // Check if historical flood spots already exist
    const existingPlaces = await FallbackPlace.countDocuments();
    if (existingPlaces > 0) {
      console.log('✅ Historical flood spots already exist');
      return;
    }
    
    // Get admin user to assign as creator
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) {
      console.log('⚠️  No admin user found, skipping historical flood spots seeding');
      return;
    }
    
    // Sample historical flood spots data
    const samplePlaces = [
      {
        name: 'Mindanao Ave near Barangay Hall',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0244, 14.5547] // Manila coordinates as example
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 82,
        notes: 'Road section that frequently floods during heavy rain.',
        createdBy: admin._id
      },
      {
        name: 'San Antonio Elementary Gate',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0254, 14.5557]
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 88,
        notes: 'Usually waterlogged after sustained rainfall.',
        createdBy: admin._id
      },
      {
        name: 'San Antonio Health Center Corner',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0234, 14.5537]
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 92,
        notes: 'Known flood accumulation point near drainage crossing.',
        createdBy: admin._id
      },
      {
        name: 'Central Bridge Approach',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0264, 14.5567]
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 74,
        notes: 'Approach road floods before river overflow warnings.',
        createdBy: admin._id
      },
      {
        name: 'Santa Maria Main Road Bend',
        barangay: 'Santa Maria',
        location: {
          type: 'Point',
          coordinates: [121.0344, 14.5647]
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 84,
        notes: 'Regularly flooded curve with slow drainage.',
        createdBy: admin._id
      },
      {
        name: 'Santa Maria Creekside Segment',
        barangay: 'Santa Maria',
        location: {
          type: 'Point',
          coordinates: [121.0354, 14.5657]
        },
        category: HISTORICAL_FALLBACK_CATEGORY,
        priority: 90,
        notes: 'Flood-prone strip along the creek after prolonged rain.',
        createdBy: admin._id
      }
    ];
    
    // Create historical flood spots
    const createdPlaces = await FallbackPlace.insertMany(samplePlaces);
    console.log(`✅ Created ${createdPlaces.length} sample historical flood spots`);
    
    return createdPlaces;
    
  } catch (error) {
    console.error('❌ Error seeding historical flood spots:', error);
    throw error;
  }
};

// Seed all data
export const seedAll = async () => {
  try {
    console.log('🌱 Starting complete database seeding...');
    
    await seedAdmin();
    await seedFallbackPlaces();
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
};

// CLI interface for seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  // This file is being run directly
  import('../index.js').then(async () => {
    try {
      const command = process.argv[2];
      
      switch (command) {
        case 'admin':
          await seedAdmin();
          break;
        case 'fallbacks':
          await seedFallbackPlaces();
          break;
        case 'all':
        default:
          await seedAll();
          break;
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  });
}
