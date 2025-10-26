import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromHeader } from '../../lib/auth';
import { getUserById, updateUser } from '../../lib/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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

    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { action, tierId } = req.body;

    if (action === 'subscribe') {
      // Create or update subscription
      if (!tierId) {
        return res.status(400).json({ error: 'Tier ID is required for subscription' });
      }

      // Pricing tiers (in cents)
      const tierPricing: Record<string, { amount: number; name: string; messages: number }> = {
        'basic': { amount: 499, name: 'Basic Plan', messages: 200 },
        'premium': { amount: 1499, name: 'Premium Plan', messages: 1000 },
      };

      const tier = tierPricing[tierId] || tierPricing['basic'];

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id.toString() }
        });
        customerId = customer.id;
        await updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `${tier.messages.toLocaleString()} messages per month with Neville's wisdom.`,
            },
            unit_amount: tier.amount,
            recurring: {
              interval: 'month',
            },
          },
        }],
        metadata: {
          userId: user.id.toString(),
          tierId: tierId,
        },
      });

      // Update user subscription
      await updateUser(user.id, {
        subscriptionTier: tierId,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
        messagesUsedThisMonth: 0
      });

      return res.status(200).json({
        message: 'Subscription created successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          tierId: tierId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        }
      });

    } else if (action === 'cancel') {
      // Cancel subscription
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription to cancel' });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await updateUser(user.id, {
        subscriptionStatus: 'cancelled'
      });

      return res.status(200).json({
        message: 'Subscription will be cancelled at the end of the current period'
      });

    } else if (action === 'reactivate') {
      // Reactivate cancelled subscription
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No subscription to reactivate' });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      await updateUser(user.id, {
        subscriptionStatus: 'active'
      });

      return res.status(200).json({
        message: 'Subscription reactivated successfully'
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use: subscribe, cancel, or reactivate' });
    }

  } catch (error) {
    console.error('Subscription management error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}