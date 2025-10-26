import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromHeader } from '../../lib/auth';
import { getUserById } from '../../lib/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user data
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}