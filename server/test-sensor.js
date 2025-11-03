// Test script for sensor endpoint
// Run this after starting the server to verify the sensor endpoint works

const testSensorEndpoint = async () => {
  const serverUrl = 'http://192.168.0.114:5174/api/sensor-data';
  
  console.log('🧪 Testing Sensor Endpoint...\n');
  
  // Test 1: POST sensor data
  console.log('Test 1: Posting sensor data...');
  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ distance: 12.34 })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ POST successful!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ POST failed!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ POST error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: GET sensor data
  console.log('Test 2: Getting sensor data...');
  try {
    const response = await fetch(serverUrl);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ GET successful!');
      console.log(`   Found ${data.count} readings`);
      if (data.data.length > 0) {
        console.log('   Latest reading:', JSON.stringify(data.data[0], null, 2));
      }
    } else {
      console.log('❌ GET failed!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ GET error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: GET latest reading
  console.log('Test 3: Getting latest reading...');
  try {
    const response = await fetch(`${serverUrl}/latest`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ GET latest successful!');
      console.log('   Latest reading:', JSON.stringify(data.data, null, 2));
    } else {
      console.log('❌ GET latest failed!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ GET latest error:', error.message);
  }
  
  console.log('\n✅ Testing complete!\n');
};

// Run the test
testSensorEndpoint().catch(console.error);
