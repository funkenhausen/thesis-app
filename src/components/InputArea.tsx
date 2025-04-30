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
                sticky bottom-0 z-10 flex items-center gap-2 p-3
                ${theme === 'dark'
                  ? 'bg-[#343541] border-t border-[#3E3F4B]'     /* dark bg & border */
                  : 'bg-[#FFFFFF] border-t border-[#E5E7EB]'}     /* light bg & border */
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
                    flex-grow resize-none rounded-lg px-4 py-2 transition-all duration-200
                    focus:outline-none focus:ring-2
                    ${theme === 'dark'
                      ? 'bg-[#202123] text-[#ECECF1] placeholder-[#A1A1AA] border border-[#3E3F4B] focus:ring-[#10A37F]'
                      : 'bg-[#F7F7F8] text-[#111111] placeholder-[#52525B] border border-[#E5E7EB] focus:ring-[#10A37F]'}
                  `}
        aria-label="Chat input"
      />

      {inputValue.trim().length > 0 && (
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Send message"
          className={`
                      p-2 rounded-full transition-colors duration-200
                      ${isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                          ? 'bg-[#10A37F] hover:bg-[#0E8C6E]'
                          : 'bg-[#10A37F] hover:bg-[#0E8C6E]'}
                    `}
        >
          <FaPaperPlane className="w-5 h-5 text-white rotate-90" />
        </button>
      )}
    </form>
  );
};

export default InputArea;
