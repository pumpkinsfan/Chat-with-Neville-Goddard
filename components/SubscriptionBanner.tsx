import React from 'react';

interface SubscriptionBannerProps {
  isSubscribed: boolean;
  remainingMessages: number;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ isSubscribed, remainingMessages }) => {
  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-3 flex items-center justify-center gap-2 font-bold">
        <span>✨</span>
        <span>Premium Access - Unlimited Conversations</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white px-6 py-3 flex items-center justify-center gap-2">
      <span className="font-semibold">
        {remainingMessages} free message{remainingMessages !== 1 ? 's' : ''} remaining
      </span>
    </div>
  );
};

export default SubscriptionBanner;

