// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Message, EmotionApiResponse, EmotionApiErrorResponse, AppSettings, ChatHistoryItem } from './types';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';

// --- Configuration ---
// Replace with your actual Flask backend URL
const API_URL = 'http://127.0.0.1:5000/predict'; // Example URL
// ---------------------

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-bot-msg',
      sender: 'bot',
      emotions: { Info: 1.0 },
      text: "Hello! Tell me something and I'll try to guess the emotion.",
      timestamp: Date.now(),
    },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    apiUrl: API_URL,
  });
  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: 'First Chat',
      lastMessage: 'Hello! Tell me something...',
      messages: [],
      timestamp: Date.now(),
    },
  ]);
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#343541' : '#FFFFFF';
  }, [settings.theme]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(settings.apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`;
        try { const errorData: EmotionApiErrorResponse = await response.json(); if (errorData.error) errorMsg = errorData.error; } catch {}
        throw new Error(errorMsg);
      }
      const data: EmotionApiResponse = await response.json();
      if (!data.emotions || typeof data.emotions !== 'object') throw new Error('Invalid emotion data received from server.');
      const botMessage: Message = { id: `bot-${Date.now()}`, sender: 'bot', emotions: data.emotions, timestamp: Date.now() };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(msg);
      const errorBotMessage: Message = { id: `bot-error-${Date.now()}`, sender: 'bot', error: `Sorry, I couldn't process that. ${msg}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally { setIsLoading(false); }
  }, [settings.apiUrl]);

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Main chat area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transform transition-all duration-300 ease-in-out relative
          ${!sidebarCollapsed ? 'translate-x-64' : 'translate-x-0'}
          ${settings.theme === 'dark' ? 'text-[#ECECF1] bg-[#202123]' : 'text-[#111111] bg-[#F7F7F8]'}`}
      >
        <header
          className={`shadow-sm flex items-center px-4 h-16 sticky top-0 z-30
            transition-all duration-300 ease-in-out
            ${settings.theme === 'dark' ? 'bg-[#343541] border-b border-[#3E3F4B]' : 'bg-[#FFFFFF] border-b border-[#E5E7EB]'}`}
        >
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            type="button"
            aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
            className={`focus:outline-none p-2 rounded-full mr-2 transition-colors duration-300
              ${settings.theme === 'dark' ? 'text-[#A1A1AA] hover:text-[#ECECF1] hover:bg-[#444654]' : 'text-[#52525B] hover:text-[#111111] hover:bg-[#FFFFFF]'}`}
          >
            <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Emotion Detector Chat</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} isLoading={isLoading} theme={settings.theme} />
        </div>

        <div className="sticky bottom-0 w-full">
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} theme={settings.theme} />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={!sidebarCollapsed}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onOpenSettings={() => setSettingsOpen(true)}
        chatHistory={chatHistory}
        theme={settings.theme}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};

export default App;
