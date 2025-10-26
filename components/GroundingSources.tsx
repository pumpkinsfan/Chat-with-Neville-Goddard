import React from 'react';
import { Source } from '../types';

interface GroundingSourcesProps {
  sources: Source[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  return (
    <div className="mt-4 pt-3 border-t border-gray-600/50">
      <p className="text-xs text-gray-400 font-semibold mb-2">Sources:</p>
      <ul className="space-y-1">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-300 hover:text-amber-200 underline"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroundingSources;
