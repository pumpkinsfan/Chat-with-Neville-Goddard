import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../utils/subscriptionTiers';

const PaywallMessage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const handleUnlock = async (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setIsLoading(true);
    setError(null);

    try {
      // Call our Vercel serverless function to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tierId: tier.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Get Stripe instance from window using environment variable
      // Use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel env vars
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51JHsqxCuriuL8q783aNRFkXtcDlsbEpMw8kVuP5jLtwGjqxZUsMgKmIGcQI5BnICdxh8GYDq2dvdDLMhjNLKWbFq00KJ9csoIT';
      const stripe = (window as any).Stripe(publishableKey);
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-slate-400 text-lg">
          You've used all 5 free messages. Select a plan to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <div
            key={tier.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{tier.badge}</span>
              <h3 className="text-xl font-bold text-white">{tier.name}</h3>
            </div>
            
            <div className="text-3xl font-bold text-white mb-2">
              ${tier.price}
              <span className="text-sm text-slate-400 font-normal">/month</span>
            </div>
            
            <div className="text-slate-400 text-sm mb-4">
              {tier.messagesPerMonth.toLocaleString()} messages/month
            </div>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUnlock(tier)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && selectedTier?.id === tier.id ? 'Processing...' : `Select ${tier.name}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <span>🔒</span>
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
};

export default PaywallMessage;
