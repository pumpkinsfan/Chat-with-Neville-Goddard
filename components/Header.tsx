
import React from 'react';
import UpgradeButton from './UpgradeButton';

interface HeaderProps {
  isSubscribed: boolean;
  tierName?: string;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSubscribed, tierName, onUpgradeClick, onLoginClick }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm shadow-lg p-4 border-b border-amber-500/20 flex-shrink-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-amber-100 tracking-wider">Chat with Neville</h1>
          <p className="text-sm text-slate-400">Assume the feeling of the wish fulfilled</p>
        </div>
        <div className="ml-4 flex items-center gap-3">
          {!isSubscribed && (
            <button
              onClick={onLoginClick}
              className="text-amber-200 hover:text-amber-100 font-medium text-sm transition-colors"
            >
              Login
            </button>
          )}
          <UpgradeButton
            isSubscribed={isSubscribed}
            tierName={tierName}
            onClick={onUpgradeClick}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

