import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'neville_chat.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (error) {
  // Directory might already exist
}

const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  subscriptionTier: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  messagesUsedThisMonth: number;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'incomplete' | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  userId: number;
  role: 'user' | 'model';
  text: string;
  sources: string | null; // JSON string
  createdAt: string;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        subscription_tier TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        messages_used_this_month INTEGER DEFAULT 0,
        subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'incomplete', NULL)),
        subscription_end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'model')),
        text TEXT NOT NULL,
        sources TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// User operations
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO users (email, password_hash, role, subscription_tier, stripe_customer_id, stripe_subscription_id, messages_used_this_month, subscription_status, subscription_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userData.email,
      userData.passwordHash,
      userData.role,
      userData.subscriptionTier,
      userData.stripeCustomerId,
      userData.stripeSubscriptionId,
      userData.messagesUsedThisMonth,
      userData.subscriptionStatus,
      userData.subscriptionEndDate
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        getUserById(this.lastID).then(resolve).catch(reject);
      }
    });
  });
}

export async function getUserById(id: number): Promise<User | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as User | null);
      }
    });
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as User | null);
      }
    });
  });
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => (updates as any)[field]);
  
  if (fields.length === 0) return getUserById(id);
  
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [...values, id], function(err) {
      if (err) {
        reject(err);
      } else {
        getUserById(id).then(resolve).catch(reject);
      }
    });
  });
}

export async function getAllUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as User[]);
      }
    });
  });
}

// Chat message operations
export async function saveChatMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO chat_messages (user_id, role, text, sources)
      VALUES (?, ?, ?, ?)
    `, [
      messageData.userId,
      messageData.role,
      messageData.text,
      messageData.sources
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        getChatMessageById(this.lastID).then(resolve).catch(reject);
      }
    });
  });
}

export async function getChatMessageById(id: number): Promise<ChatMessage | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chat_messages WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as ChatMessage | null);
      }
    });
  });
}

export async function getChatMessagesByUserId(userId: number, limit: number = 50): Promise<ChatMessage[]> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [userId, limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as ChatMessage[]);
      }
    });
  });
}

export async function deleteChatMessagesByUserId(userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM chat_messages WHERE user_id = ?', [userId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Admin operations
export async function getUsersWithSubscriptions(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM users 
      WHERE subscription_tier IS NOT NULL 
      ORDER BY created_at DESC
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as User[]);
      }
    });
  });
}

export async function resetUserMessageCount(userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE users 
      SET messages_used_this_month = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [userId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function resetAllMessageCounts(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE users 
      SET messages_used_this_month = 0, updated_at = CURRENT_TIMESTAMP
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Close database connection
export function closeDatabase() {
  db.close();
}

export { db };