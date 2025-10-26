// File: /api/create-checkout-session.ts

import Stripe from 'stripe';

// This is a required step for Vercel - using Node.js runtime for Stripe support
export const config = {
  runtime: 'nodejs',
};

// Initialize Stripe with your secret key from environment variables.
// NOTE: This MUST be your SECRET key (sk_live_...)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// This is the function that will be executed when the frontend calls /api/create-checkout-session
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { tierId } = body;

    // Determine the base URL for redirects.
    const YOUR_DOMAIN = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    // Pricing tiers (in cents)
    const tierPricing: Record<string, { amount: number; name: string; messages: number }> = {
      'basic': { amount: 499, name: 'Basic Plan', messages: 200 },
      'premium': { amount: 1499, name: 'Premium Plan', messages: 1000 },
    };

    const tier = tierPricing[tierId] || tierPricing['basic'];

    // Create a Checkout Session with Stripe.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `Unlock ${tier.messages.toLocaleString()} messages per month with Neville's wisdom.`,
            },
            unit_amount: tier.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription', // Recurring payment
      success_url: `${YOUR_DOMAIN}?session_id={CHECKOUT_SESSION_ID}`, // Redirect here on success
      cancel_url: `${YOUR_DOMAIN}`, // Redirect here if they cancel
      metadata: {
        tierId: tierId,
        tierName: tier.name,
      },
    });

    // Send the session ID back to the frontend.
    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error((err as Error).message);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
