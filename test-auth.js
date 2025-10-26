// Simple test script to verify authentication endpoints
const API_BASE = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test registration
    console.log('1. Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful');
      console.log('   User ID:', registerData.user.id);
      console.log('   Token received:', !!registerData.token);
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.error);
    }

    // Test login
    console.log('\n2. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nevillechat.com',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      console.log('   Role:', loginData.user.role);
      console.log('   Token received:', !!loginData.token);

      // Test admin endpoint
      console.log('\n3. Testing admin endpoint...');
      const adminResponse = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('✅ Admin endpoint accessible');
        console.log('   Users found:', adminData.total);
      } else {
        console.log('❌ Admin endpoint failed:', adminResponse.status);
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.error);
    }

    console.log('\n🎉 Authentication system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuth();