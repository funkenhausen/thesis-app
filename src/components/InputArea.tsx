// src/components/InputArea.tsx
import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { InputAreaProps } from '../types';
import { FaPaperPlane } from 'react-icons/fa';

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, theme }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed && !isLoading) {
      onSendMessage(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        w-full flex items-end gap-2 px-4 py-3 border-t
        ${theme === 'dark' ? 'bg-[#343541] border-[#3E3F4B]' : 'bg-[#FFFFFF] border-[#E5E7EB]'}
      `}
    >
      <textarea
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isLoading}
        rows={1}
        className={`
          flex-grow resize-none overflow-auto max-h-40 min-h-[2.5rem] rounded-lg px-4 py-2
          focus:outline-none focus:ring-2 transition-all duration-200
          ${theme === 'dark'
            ? 'bg-[#202123] text-[#ECECF1] placeholder-[#A1A1AA] border border-[#3E3F4B] focus:ring-[#10A37F]'
            : 'bg-[#F7F7F8] text-[#111111] placeholder-[#52525B] border border-[#E5E7EB] focus:ring-[#10A37F]'}
        `}
        aria-label="Chat input"
      />

      <button
        type="submit"
        disabled={isLoading || inputValue.trim().length === 0}
        aria-label="Send message"
        className={`
          p-2 rounded-full transition-colors duration-200 flex items-center justify-center
          ${isLoading || inputValue.trim().length === 0
            ? 'opacity-50 cursor-not-allowed'
            : theme === 'dark'
              ? 'bg-[#10A37F] hover:bg-[#0E8C6E]'
              : 'bg-[#10A37F] hover:bg-[#0E8C6E]'}
        `}
      >
        <FaPaperPlane className="w-5 h-5 text-white rotate-90" />
      </button>
    </form>
  );
};

export default InputArea;
