// src/components/MessageBubble.tsx
import React from 'react';
// Make sure Message type is imported correctly from your types file
import { Message } from '../types';

// **** CRITICAL CHECK ****
// Ensure this interface is defined correctly WITHIN MessageBubble.tsx
// OR correctly imported if defined centrally (but internal definition is common)
interface MessageBubbleProps {
  message: Message;         // Expects 'message' (singular)
  theme: 'dark' | 'light';
}

// Helper to format timestamp (adjust format as needed)
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// **** CRITICAL CHECK ****
// Ensure the component is defined as a React Functional Component
// accepting the MessageBubbleProps interface
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => { // Line ~16
  // ... rest of the component code as provided before ...
  const isUser = message.sender === 'user';

  const bubbleClasses = isUser
    ? theme === 'dark'
      ? 'bg-[#1E2228] text-[#ECECF1] ml-auto'
      : 'bg-[#DCF8C6] text-[#111111] ml-auto'
    : theme === 'dark'
      ? 'bg-[#444654] text-[#ECECF1] border border-[#3E3F4B] mr-auto'
      : 'bg-[#E8E8E8] text-[#111111] border border-[#E5E7EB] mr-auto';

  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const textClasses = theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]';
  const secondaryTextClasses = theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]';
  const timestampClasses = `text-xs mt-1 ${secondaryTextClasses} ${isUser ? 'text-right' : 'text-left'}`;

  // Check if line 26 falls somewhere within this return block
  return ( // ~ Line 25 or so
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
                 <div key={emotion} className="flex justify-between items-center gap-2">
                   <span className={secondaryTextClasses}>{emotion}:</span>
                   <div className="flex-grow h-2 bg-gray-600 rounded overflow-hidden">
                      <div
                        className="h-full bg-[#10A37F]"
                        style={{ width: `${(probability * 100).toFixed(0)}%` }}
                      ></div>
                    </div>
                   <span className={`font-medium w-10 text-right ${textClasses}`}>
                     {(probability * 100).toFixed(0)}%
                   </span>
                 </div>
               ))}
           </div>
        )}

        {message.sender === 'bot' && message.error && (
          <p className="text-red-400 text-sm mt-1">Error: {message.error}</p>
        )}

        <p className={timestampClasses}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;