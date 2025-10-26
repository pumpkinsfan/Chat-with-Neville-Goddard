export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  role: Role;
  text: string;
  sources?: Source[];
}

export interface User {
  id: number;
  email: string;
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

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface SubscriptionResponse {
  message: string;
  subscription?: {
    id: string;
    status: string;
    tierId: string;
    currentPeriodEnd: string;
  };
}
