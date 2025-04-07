// src/components/MessageBubble.tsx
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  theme: 'dark' | 'light';
}

// Helper function to format emotions, sorted by probability
const formatEmotions = (emotions: Record<string, number>, theme: 'dark' | 'light'): React.ReactNode => {
  const sortedEmotions = Object.entries(emotions)
    .sort(([, probA], [, probB]) => probB - probA); // Sort descending

  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';

  return (
    <div className="space-y-1 text-base">
      {sortedEmotions.map(([emotion, probability]) => (
        <div key={emotion} className="flex justify-between">
          <span className={textColor}>{emotion}:</span>
          <span className={`font-medium ${textColor}`}>
            {`${(probability * 100).toFixed(0)}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => {
  const isUser = message.sender === 'user';
  const bubbleClasses = isUser
    ? 'bg-blue-700 text-white ml-auto' // User message styles
    : theme === 'dark'
      ? 'bg-gray-800 text-white border border-gray-700 mr-auto' // Bot dark mode
      : 'bg-white text-gray-900 border border-gray-200 mr-auto'; // Bot light mode

  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

  return (
    <div className={containerClasses}>
      <div className={`p-3 rounded-lg max-w-md md:max-w-lg shadow-md transition-colors duration-300 ${bubbleClasses}`}>
        {isUser && message.text && <p>{message.text}</p>}
        {message.sender === 'bot' && message.emotions && formatEmotions(message.emotions, theme)}
        {message.sender === 'bot' && message.error && (
          <p className="text-red-400 text-sm">Error: {message.error}</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;