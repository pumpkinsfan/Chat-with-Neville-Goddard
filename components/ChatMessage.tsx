import React from 'react';
import { Message, Role } from '../types';
import GroundingSources from './GroundingSources';

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
  const avatarSrc = isUser ? '/assets/user-avatar.svg' : '/assets/neville-avatar.svg';

  return (
    <div className={`w-full ${wrapperClasses}`}>
      <div className="max-w-xl w-full">
        <div className={`flex items-center mb-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <img 
            src={avatarSrc} 
            alt={authorName}
            className="w-6 h-6 rounded-full mr-2"
          />
          <p className={`text-xs font-semibold ${authorClasses}`}>
            {authorName}
          </p>
        </div>
        <div className={`p-4 shadow-md ${bubbleClasses}`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          {message.sources && message.sources.length > 0 && (
            <GroundingSources sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
