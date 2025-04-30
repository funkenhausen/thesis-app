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

  useEffect(scrollToBottom, [messages]);

  return (
    <div
      className={`
        flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth
        ${theme === 'dark' ? 'bg-[#202123]' : 'bg-[#F7F7F8]'}
      `}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} theme={theme} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
                  <div
                    className={`
                      p-3 rounded-lg max-w-md md:max-w-lg shadow-md italic
                      ${theme === 'dark'
                        ? 'bg-[#444654] text-[#A1A1AA]'
                        : 'bg-[#E8E8E8] text-[#52525B]'}
                    `}
                  >
                    Thinking...
                  </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
