import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../utils/subscriptionTiers';
import PaymentForm from './PaymentForm';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (tier: SubscriptionTier) => void;
  currentTier?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectTier, currentTier }) => {
  const [selectedTierForPayment, setSelectedTierForPayment] = useState<SubscriptionTier | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTierForPayment(tier);
  };

  const handlePaymentSuccess = () => {
    onClose();
    window.location.reload(); // Reload to update subscription status
  };

  const handleCancelPayment = () => {
    setSelectedTierForPayment(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6">
          {selectedTierForPayment ? (
            // Show Payment Form
            <div>
              <button
                onClick={handleCancelPayment}
                className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to plans
              </button>
              <PaymentForm
                tier={selectedTierForPayment}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </div>
          ) : (
            // Show Tier Selection
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrentTier = currentTier === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`border rounded-xl p-6 transition-all cursor-pointer ${
                    isCurrentTier
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 hover:border-slate-600 hover:border-amber-500'
                  }`}
                  onClick={() => !isCurrentTier && handleSelectTier(tier)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{tier.badge}</span>
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        ${tier.price}
                        <span className="text-sm text-slate-400 font-normal">/month</span>
                      </div>
                    </div>
                    {isCurrentTier && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 text-sm mb-4">
                    {tier.messagesPerMonth.toLocaleString()} messages/month
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isCurrentTier
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900'
                    }`}
                    disabled={isCurrentTier}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCurrentTier) handleSelectTier(tier);
                    }}
                  >
                    {isCurrentTier ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
              </div>

              <div className="mt-6 text-center text-slate-400 text-sm">
                All plans include full access to Neville's teachings and Google Search integration
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;

