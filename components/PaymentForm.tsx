import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '../utils/subscriptionTiers';

interface PaymentFormProps {
  tier: SubscriptionTier;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ tier, onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [cardElement, setCardElement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);

  useEffect(() => {
    // Get Stripe instance
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      'pk_live_51JHsqxCuriuL8q783aNRFkXtcDlsbEpMw8kVuP5jLtwGjqxZUsMgKmIGcQI5BnICdxh8GYDq2dvdDLMhjNLKWbFq00KJ9csoIT';

    const stripeInstance = (window as any).Stripe(publishableKey);
    setStripe(stripeInstance);

    // Create Elements instance
    const elementsInstance = stripeInstance.elements();
    setElements(elementsInstance);

    // Create and mount Card Element
    const card = elementsInstance.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
          '::placeholder': {
            color: '#94a3b8',
          },
          backgroundColor: '#334155',
        },
        invalid: {
          color: '#ef4444',
        },
      },
    });

    card.mount('#card-element');
    setCardElement(card);

    return () => {
      card.destroy();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !cardElement || !email) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create Payment Intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: tier.id,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful!
        localStorage.setItem('neville_subscribed', 'true');
        localStorage.setItem('neville_subscription_tier', tier.id);
        localStorage.setItem('neville_tier_name', tier.name);
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h3>
        <div className="flex items-center justify-between text-slate-300">
          <span>{tier.name}</span>
          <span className="text-2xl font-bold text-amber-400">${tier.price}/mo</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {tier.messagesPerMonth.toLocaleString()} messages per month
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="card-element" className="block text-sm font-medium text-slate-300 mb-2">
            Card Information
          </label>
          <div
            id="card-element"
            className="p-4 bg-slate-700 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-amber-500"
          ></div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Pay $${tier.price}`}
          </button>
        </div>
      </form>

      <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secured by Stripe</span>
      </div>
    </div>
  );
};

export default PaymentForm;
