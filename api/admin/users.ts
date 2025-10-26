import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromHeader, isAdmin } from '../../lib/auth';
import { getUserById, getAllUsers, getUsersWithSubscriptions, resetUserMessageCount, resetAllMessageCounts } from '../../lib/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract and verify token
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const user = await getUserById(payload.userId);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const { type } = req.query;
      
      let users;
      if (type === 'subscribed') {
        users = await getUsersWithSubscriptions();
      } else {
        users = await getAllUsers();
      }

      // Remove password hashes from response
      const usersWithoutPasswords = users.map(({ passwordHash: _, ...user }) => user);

      return res.status(200).json({
        users: usersWithoutPasswords,
        total: usersWithoutPasswords.length
      });

    } else if (req.method === 'POST') {
      const { action, userId } = req.body;

      if (action === 'reset_messages') {
        if (userId) {
          await resetUserMessageCount(userId);
          return res.status(200).json({
            message: `Message count reset for user ${userId}`
          });
        } else {
          await resetAllMessageCounts();
          return res.status(200).json({
            message: 'Message counts reset for all users'
          });
        }
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    }

  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}