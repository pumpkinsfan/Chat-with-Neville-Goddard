
import React from 'react';
import UpgradeButton from './UpgradeButton';

interface HeaderProps {
  isSubscribed: boolean;
  tierName?: string;
  onUpgradeClick: () => void;
  onLogout?: () => void;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ isSubscribed, tierName, onUpgradeClick, onLogout, userEmail }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm shadow-lg p-4 border-b border-amber-500/20 flex-shrink-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-amber-100 tracking-wider">Chat with Neville</h1>
          <p className="text-sm text-slate-400">Assume the feeling of the wish fulfilled</p>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="text-sm text-slate-300">
              {userEmail}
            </div>
          )}
          <UpgradeButton 
            isSubscribed={isSubscribed} 
            tierName={tierName}
            onClick={onUpgradeClick} 
          />
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-slate-300 text-sm px-3 py-1 rounded border border-slate-600 hover:border-slate-500 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

