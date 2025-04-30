// src/components/MessageBubble.tsx
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  theme: 'dark' | 'light';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => {
  const isUser = message.sender === 'user';


  const bubbleClasses = isUser
    ? theme === 'dark'
      ? 'bg-[#1E2228] text-[#ECECF1] ml-auto'        // user dark
      : 'bg-[#DCF8C6] text-[#111111] ml-auto'        // user light
    : theme === 'dark'
      ? 'bg-[#444654] text-[#ECECF1] border border-[#3E3F4B] mr-auto'  // bot dark
      : 'bg-[#E8E8E8] text-[#111111] border border-[#E5E7EB] mr-auto';  // bot light

  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

  const textClasses = theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]';

  const secondaryTextClasses = theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]';

  return (
    <div className={containerClasses}>
      <div
        className={`p-3 rounded-lg max-w-md md:max-w-lg shadow-md transition-colors duration-300 ${bubbleClasses}`}
      >
        {message.text && (
          <p className={`whitespace-pre-wrap ${textClasses}`}>{message.text}</p>
        )}

        {message.sender === 'bot' && message.emotions && (
          <div className="mt-2 space-y-1 text-base">
            {Object.entries(message.emotions)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, probability]) => (
                <div key={emotion} className="flex justify-between">
                  <span className={secondaryTextClasses}>{emotion}:</span>
                  <span className={`font-medium ${textClasses}`}>
                    {(probability * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        )}

        {message.sender === 'bot' && message.error && (
          <p className="text-red-400 text-sm">Error: {message.error}</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
