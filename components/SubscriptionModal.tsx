import React from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited conversations with Neville',
        'Chat history storage',
        'Basic manifesting guidance',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: 'month',
      popular: true,
      features: [
        'Everything in Basic',
        'Advanced manifesting techniques',
        'Personalized affirmations',
        'Priority support',
        'Export chat history',
        'Custom Neville personas'
      ]
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '$199.99',
      period: 'one-time',
      features: [
        'Everything in Premium',
        'Lifetime access',
        'Future features included',
        'VIP support',
        'Exclusive Neville content',
        'Advanced analytics'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-amber-500/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-amber-100">Choose Your Path</h2>
              <p className="text-slate-400 mt-1">Unlock the full power of Neville's teachings</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-slate-700/50 rounded-xl p-6 border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                  plan.popular
                    ? 'border-amber-500 shadow-amber-500/20 shadow-lg'
                    : 'border-slate-600 hover:border-amber-400'
                }`}
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-amber-400">{plan.price}</span>
                    <span className="text-slate-400 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-white'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              "The law of assumption is the law of creation. What you assume, you create." - Neville Goddard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;