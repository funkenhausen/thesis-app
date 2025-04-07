// src/components/InputArea.tsx
import React, { useState, FormEvent } from 'react';
import { InputAreaProps } from '../types';

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, theme }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInputValue(''); // Clear input after sending
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex items-center gap-2 sticky bottom-0 transition-colors duration-300`}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className={`flex-grow h-10 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-600 text-white'
            : 'bg-gray-50 border border-gray-300 text-gray-900'
        }`}
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={isLoading || inputValue.trim().length === 0}
        className={`h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M3.105 3.105a.75.75 0 01.814-.398l14.25 5.25a.75.75 0 010 1.486l-14.25 5.25a.75.75 0 01-1.112-.814l1.85-6.854a.75.75 0 000-.318L1.8 3.917a.75.75 0 01.398-.813z" />
        </svg>
      </button>
    </form>
  );
};

export default InputArea;