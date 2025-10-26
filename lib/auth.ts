import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

export function canSendMessage(user: User, messagesUsed: number): boolean {
  // Admin users have unlimited messages
  if (isAdmin(user)) {
    return true;
  }

  // Free users have 5 messages
  if (!user.subscriptionTier) {
    return messagesUsed < 5;
  }

  // Subscribed users have tier-based limits
  const tierLimits: Record<string, number> = {
    'basic': 200,
    'premium': 1000
  };

  const limit = tierLimits[user.subscriptionTier] || 0;
  return messagesUsed < limit;
}

export function getMessageLimit(user: User): number {
  if (isAdmin(user)) {
    return 999999; // Effectively unlimited
  }

  if (!user.subscriptionTier) {
    return 5; // Free tier
  }

  const tierLimits: Record<string, number> = {
    'basic': 200,
    'premium': 1000
  };

  return tierLimits[user.subscriptionTier] || 0;
}