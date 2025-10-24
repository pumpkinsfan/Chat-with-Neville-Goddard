import React from 'react';
import { Message, Role } from '../types';
import GroundingSources from './GroundingSources';

const NevilleAvatar: React.FC<{className?: string}> = ({className}) => (
  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg ${className}`}>
    N
  </div>
);

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-amber-800/80 text-white rounded-l-2xl rounded-tr-2xl'
    : 'bg-slate-700/80 text-gray-200 rounded-r-2xl rounded-tl-2xl';
  const authorName = isUser ? 'You' : 'Neville';
  const authorClasses = isUser ? 'text-right text-amber-300' : 'text-left text-slate-400';

  return (
    <div className={`w-full ${wrapperClasses}`}>
      <div className="max-w-xl w-full">
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser && <NevilleAvatar className="flex-shrink-0 mt-1" />}
          <div className="flex-1">
            <p className={`text-xs font-semibold mb-1 px-1 ${authorClasses}`}>
              {authorName}
            </p>
            <div className={`p-4 shadow-md ${bubbleClasses}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              {message.sources && message.sources.length > 0 && (
                <GroundingSources sources={message.sources} />
              )}
            </div>
          </div>
          {isUser && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 mt-1">
              U
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
