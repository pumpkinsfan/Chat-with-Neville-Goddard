
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="max-w-xl w-full bg-red-900/50 border border-red-700 text-red-200 rounded-lg p-4 text-center">
        <p className="font-semibold">An Error Occurred</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
