import { User, AuthResponse, SubscriptionResponse } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.vercel.app/api' 
  : 'http://localhost:3000/api';

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token and user from localStorage on initialization
    this.token = localStorage.getItem('neville_token');
    this.user = this.getStoredUser();
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('neville_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private setAuthData(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('neville_token', token);
    localStorage.setItem('neville_user', JSON.stringify(user));
  }

  private clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('neville_token');
    localStorage.removeItem('neville_user');
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setAuthData(data.token, data.user);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setAuthData(data.token, data.user);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      localStorage.setItem('neville_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.clearAuthData();
      return null;
    }
  }

  async subscribe(tierId: string): Promise<SubscriptionResponse> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/subscription/manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ action: 'subscribe', tierId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Subscription failed');
    }

    return await response.json();
  }

  async cancelSubscription(): Promise<SubscriptionResponse> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/subscription/manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ action: 'cancel' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Cancellation failed');
    }

    return await response.json();
  }

  async reactivateSubscription(): Promise<SubscriptionResponse> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/subscription/manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ action: 'reactivate' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Reactivation failed');
    }

    return await response.json();
  }

  logout() {
    this.clearAuthData();
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  canSendMessage(): boolean {
    if (!this.user) return false;
    
    // Admin users have unlimited messages
    if (this.isAdmin()) {
      return true;
    }

    // Free users have 5 messages
    if (!this.user.subscriptionTier) {
      return this.user.messagesUsedThisMonth < 5;
    }

    // Subscribed users have tier-based limits
    const tierLimits: Record<string, number> = {
      'basic': 200,
      'premium': 1000
    };

    const limit = tierLimits[this.user.subscriptionTier] || 0;
    return this.user.messagesUsedThisMonth < limit;
  }

  getMessageLimit(): number {
    if (!this.user) return 0;
    
    if (this.isAdmin()) {
      return 999999; // Effectively unlimited
    }

    if (!this.user.subscriptionTier) {
      return 5; // Free tier
    }

    const tierLimits: Record<string, number> = {
      'basic': 200,
      'premium': 1000
    };

    return tierLimits[this.user.subscriptionTier] || 0;
  }

  getRemainingMessages(): number {
    if (!this.user) return 0;
    return Math.max(0, this.getMessageLimit() - this.user.messagesUsedThisMonth);
  }
}

export const authService = new AuthService();
export default authService;