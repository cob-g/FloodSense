import User from '../models/User.js';
import FallbackPlace from '../models/FallbackPlace.js';

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

// Seed sample fallback places
export const seedFallbackPlaces = async () => {
  try {
    console.log('🌱 Seeding sample fallback places...');
    
    // Check if fallback places already exist
    const existingPlaces = await FallbackPlace.countDocuments();
    if (existingPlaces > 0) {
      console.log('✅ Fallback places already exist');
      return;
    }
    
    // Get admin user to assign as creator
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) {
      console.log('⚠️  No admin user found, skipping fallback places seeding');
      return;
    }
    
    // Sample fallback places data
    const samplePlaces = [
      {
        name: 'Barangay Hall',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0244, 14.5547] // Manila coordinates as example
        },
        category: 'government',
        priority: 90,
        notes: 'Main government office for San Antonio',
        capacity: 100,
        contactInfo: {
          phone: '+63-2-1234-5678',
          email: 'sanantonio@city.gov.ph'
        },
        operatingHours: '8:00 AM - 5:00 PM',
        createdBy: admin._id
      },
      {
        name: 'San Antonio Elementary School',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0254, 14.5557]
        },
        category: 'evacuation_center',
        priority: 95,
        notes: 'Primary evacuation center with large gymnasium',
        capacity: 500,
        contactInfo: {
          phone: '+63-2-1234-5679'
        },
        operatingHours: '24/7 during emergencies',
        createdBy: admin._id
      },
      {
        name: 'San Antonio Health Center',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0234, 14.5537]
        },
        category: 'hospital',
        priority: 100,
        notes: 'Primary healthcare facility',
        capacity: 50,
        contactInfo: {
          phone: '+63-2-1234-5680',
          email: 'health@sanantonio.gov.ph'
        },
        operatingHours: '24/7',
        createdBy: admin._id
      },
      {
        name: 'Central Bridge',
        barangay: 'San Antonio',
        location: {
          type: 'Point',
          coordinates: [121.0264, 14.5567]
        },
        category: 'bridge',
        priority: 70,
        notes: 'Main bridge connecting to neighboring barangay',
        createdBy: admin._id
      },
      {
        name: 'Barangay Santa Maria Hall',
        barangay: 'Santa Maria',
        location: {
          type: 'Point',
          coordinates: [121.0344, 14.5647]
        },
        category: 'government',
        priority: 90,
        notes: 'Government office for Santa Maria',
        capacity: 80,
        contactInfo: {
          phone: '+63-2-1234-5681'
        },
        operatingHours: '8:00 AM - 5:00 PM',
        createdBy: admin._id
      },
      {
        name: 'Santa Maria Community Center',
        barangay: 'Santa Maria',
        location: {
          type: 'Point',
          coordinates: [121.0354, 14.5657]
        },
        category: 'evacuation_center',
        priority: 85,
        notes: 'Community center used for evacuations',
        capacity: 300,
        contactInfo: {
          phone: '+63-2-1234-5682'
        },
        operatingHours: '24/7 during emergencies',
        createdBy: admin._id
      }
    ];
    
    // Create fallback places
    const createdPlaces = await FallbackPlace.insertMany(samplePlaces);
    console.log(`✅ Created ${createdPlaces.length} sample fallback places`);
    
    return createdPlaces;
    
  } catch (error) {
    console.error('❌ Error seeding fallback places:', error);
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
