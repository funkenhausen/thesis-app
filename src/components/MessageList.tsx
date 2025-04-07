// src/components/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import { MessageListProps } from '../types';

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, theme }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll when messages change

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} theme={theme} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
           <div className="p-3 rounded-lg max-w-md md:max-w-lg shadow-md bg-gray-700 text-gray-400 italic">
             Thinking...
           </div>
        </div>
      )}
      {/* Dummy div to help scroll to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;