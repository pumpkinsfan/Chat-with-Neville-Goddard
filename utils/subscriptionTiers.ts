export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId: string; // Stripe price ID
  messagesPerMonth: number;
  features: string[];
  color: string;
  badge: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    priceId: 'price_basic_4_99', // You'll create this in Stripe
    messagesPerMonth: 200,
    features: [
      '200 messages/month',
      'Access to all teachings',
      'Basic support',
    ],
    color: 'blue',
    badge: '✨',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 14.99,
    priceId: 'price_premium_14_99', // You'll create this in Stripe
    messagesPerMonth: 1000,
    features: [
      '1,000 messages/month',
      'Chat history saved',
      'Priority support',
      'Advanced insights',
    ],
    color: 'purple',
    badge: '⭐',
  },
];

export const FREE_TIER_LIMIT = 5;

export function getTierById(tierId: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
}

export function getMessagesRemaining(tierId: string, messagesUsedThisMonth: number): number {
  const tier = getTierById(tierId);
  if (!tier) return 0;
  return Math.max(0, tier.messagesPerMonth - messagesUsedThisMonth);
}

