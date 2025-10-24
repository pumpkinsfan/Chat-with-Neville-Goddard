import React from 'react';
import { Source } from '../types';

interface GroundingSourcesProps {
  sources: Source[];
}

const LinkIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
        <path d="M8.603 3.799a.75.75 0 0 0-1.06 1.06l1.06-1.06ZM3.799 8.603a.75.75 0 0 0 1.06-1.06l-1.06 1.06ZM8.603 16.201a.75.75 0 0 0 1.06 1.06l-1.06-1.06ZM16.201 8.603a.75.75 0 0 0-1.06-1.06l1.06 1.06Zm-7.598 7.598a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 0 5.656Z" />
    </svg>
);


const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  return (
    <div className="mt-4 pt-3 border-t border-slate-600/50">
      <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">References</h4>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index} className="flex items-start gap-2">
            <LinkIcon className="w-4 h-4 text-amber-400/80 mt-1 flex-shrink-0"/>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-300/90 hover:text-amber-200 hover:underline break-all"
              title={source.title}
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
