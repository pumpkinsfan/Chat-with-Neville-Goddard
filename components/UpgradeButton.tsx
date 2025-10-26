import React from 'react';

interface UpgradeButtonProps {
  isSubscribed: boolean;
  tierName?: string;
  onClick: () => void;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ isSubscribed, tierName, onClick }) => {
  if (isSubscribed) {
    return (
      <button
        onClick={onClick}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-purple-300 rounded-lg transition-all text-sm"
      >
        {tierName ? `Manage ${tierName}` : 'Manage Plan'}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold rounded-lg transition-all shadow-lg"
    >
      🔓 Upgrade
    </button>
  );
};

export default UpgradeButton;

