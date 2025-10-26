import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hashPassword, generateToken } from '../../lib/auth';
import { createUser, getUserByEmail } from '../../lib/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      role: 'user',
      subscriptionTier: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      messagesUsedThisMonth: 0,
      subscriptionStatus: null,
      subscriptionEndDate: null
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password hash) and token
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}