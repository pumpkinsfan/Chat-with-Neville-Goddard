// File: /api/create-payment-intent.ts

import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Stripe with your secret key from environment variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { tierId, email } = req.body;

    // Pricing tiers (in cents)
    const tierPricing: Record<string, { amount: number; name: string }> = {
      'basic': { amount: 499, name: 'Basic Plan' },
      'premium': { amount: 1499, name: 'Premium Plan' },
    };

    const tier = tierPricing[tierId] || tierPricing['basic'];

    // Create a PaymentIntent for subscription setup
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tier.amount,
      currency: 'usd',
      description: `${tier.name} - Monthly Subscription`,
      metadata: {
        tierId: tierId,
        tierName: tier.name,
        email: email || 'unknown',
      },
      // For subscription, we'll use setup_future_usage
      setup_future_usage: 'off_session',
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: tier.amount,
      tierName: tier.name,
    });
  } catch (err) {
    console.error((err as Error).message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
