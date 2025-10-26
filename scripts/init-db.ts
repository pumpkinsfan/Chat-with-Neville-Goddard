import { initializeDatabase, createUser } from '../lib/database';
import { hashPassword } from '../lib/auth';

async function initializeApp() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const { getUserByEmail } = await import('../lib/database');
    const existingAdmin = await getUserByEmail('admin@nevillechat.com');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin credentials:');
      console.log('Email: admin@nevillechat.com');
      console.log('Password: admin123');
      return;
    }
    
    // Create admin user
    const adminPassword = 'admin123';
    const passwordHash = await hashPassword(adminPassword);
    
    const adminUser = await createUser({
      email: 'admin@nevillechat.com',
      passwordHash,
      role: 'admin',
      subscriptionTier: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      messagesUsedThisMonth: 0,
      subscriptionStatus: null,
      subscriptionEndDate: null
    });
    
    console.log('Database initialized successfully!');
    console.log('Admin user created:');
    console.log('Email: admin@nevillechat.com');
    console.log('Password: admin123');
    console.log('User ID:', adminUser.id);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeApp();
}

export default initializeApp;