
import React from 'react';

interface HeaderProps {
  onUpgradeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUpgradeClick }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm shadow-lg text-center p-4 border-b border-amber-500/20 flex-shrink-0">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-amber-100 tracking-wider">Chat with Neville</h1>
          <p className="text-sm text-slate-400">Assume the feeling of the wish fulfilled</p>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            Upgrade
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
