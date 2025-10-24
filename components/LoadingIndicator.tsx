
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-xl w-full">
         <p className="text-xs font-semibold mb-1 px-1 text-left text-slate-400">
          Neville
        </p>
        <div className="bg-slate-700/80 rounded-r-2xl rounded-tl-2xl p-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-0"></div>
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
