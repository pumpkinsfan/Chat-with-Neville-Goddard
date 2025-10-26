# Authentication & User Management Setup

## Admin Credentials

**Admin Email:** `admin@nevillechat.com`  
**Admin Password:** `admin123`

## Features Implemented

### 🔐 User Authentication
- **Registration**: Users can create accounts with email and password
- **Login**: Secure JWT-based authentication
- **Logout**: Session management with token cleanup
- **Password Security**: Bcrypt hashing with salt rounds

### 👤 User Management
- **User Profiles**: Email, role, subscription status, message usage
- **Role-based Access**: Regular users and admin users
- **Message Tracking**: Per-user message count and limits

### 💳 Subscription Management
- **Subscription Tiers**: Basic (200 messages) and Premium (1000 messages)
- **Stripe Integration**: Full payment processing
- **Subscription Actions**: Subscribe, cancel, reactivate
- **Usage Tracking**: Monthly message limits and remaining counts

### 🛡️ Admin Dashboard
- **User Overview**: View all users and their subscription status
- **Message Management**: Reset individual or all user message counts
- **Subscription Monitoring**: Track active subscriptions and usage
- **Admin Privileges**: Unlimited messaging for admin accounts

## Database Schema

### Users Table
```sql
CREATE TABLE users (
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
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  sources TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Subscription Management
- `POST /api/subscription/manage` - Subscribe, cancel, or reactivate

### Admin Operations
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Reset message counts (admin only)

## Setup Instructions

### 1. Initialize Database
```bash
npm run init-db
```

### 2. Environment Variables
Make sure you have these environment variables set:
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `GEMINI_API_KEY` - Google Gemini API key

### 3. Start Development Server
```bash
npm run dev
```

## User Flow

### Regular Users
1. **Registration/Login**: Create account or sign in
2. **Free Tier**: 5 messages per month
3. **Subscription**: Upgrade to Basic (200) or Premium (1000) messages
4. **Chat**: Send messages within limits
5. **Management**: Cancel or reactivate subscription

### Admin Users
1. **Login**: Use admin credentials
2. **Dashboard**: Access admin panel
3. **User Management**: View all users and their status
4. **Message Reset**: Reset individual or all user message counts
5. **Unlimited Access**: No message limits for admin

## Security Features

- **JWT Tokens**: Secure authentication with expiration
- **Password Hashing**: Bcrypt with salt rounds
- **Role-based Access**: Admin-only endpoints protected
- **Input Validation**: Email and password validation
- **SQL Injection Protection**: Parameterized queries

## Message Limits

- **Free Users**: 5 messages per month
- **Basic Subscribers**: 200 messages per month
- **Premium Subscribers**: 1000 messages per month
- **Admin Users**: Unlimited messages

## Subscription Status

- **active**: Subscription is active and billing
- **cancelled**: Will end at current period
- **past_due**: Payment failed, needs attention
- **incomplete**: Payment setup incomplete

## Admin Dashboard Features

- View all users with their subscription status
- Filter to show only subscribed users
- Reset individual user message counts
- Reset all user message counts at once
- Monitor subscription health and usage patterns

The system is now fully functional with complete user authentication, subscription management, and admin capabilities!