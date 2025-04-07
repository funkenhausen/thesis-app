// src/App.tsx
import React, { useState, useCallback } from 'react';
import { Message, EmotionApiResponse, EmotionApiErrorResponse, AppSettings, ChatHistoryItem } from './types';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';

// --- Configuration ---
// Replace with your actual Flask backend URL
const API_URL = 'http://127.0.0.1:5000/predict'; // Example URL
// ---------------------

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      // Optional: Initial welcome message
      {
          id: 'init-bot-msg',
          sender: 'bot',
          emotions: { 'Info': 1.0 }, // Example placeholder
          text: "Hello! Tell me something and I'll try to guess the emotion.", // You can customize this
          timestamp: Date.now()
      }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // General app error state, if needed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Changed to true
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    apiUrl: API_URL,
  });
  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: 'First Chat',
      lastMessage: 'Hello! Tell me something...',
      timestamp: Date.now(),
    },
    // Add more chat history items as needed
  ]);

  // Add effect to update body background color when theme changes
  React.useEffect(() => {
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#0A0A0A' : '#FFFFFF';
  }, [settings.theme]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: Date.now(),
    };

    // Optimistically add user message
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }), // Send text in expected format
      });

      let botMessage: Message;
      const botId = `bot-${Date.now()}`;
      const botTimestamp = Date.now();

      if (!response.ok) {
          // Try to parse error from backend if possible
          let errorMsg = `Error: ${response.status} ${response.statusText}`;
          try {
              const errorData: EmotionApiErrorResponse = await response.json();
              if(errorData.error) {
                  errorMsg = errorData.error;
              }
          } catch (parseError) {
              // Ignore if response body isn't JSON or doesn't match expected error format
              console.warn("Could not parse error response body:", parseError)
          }
          throw new Error(errorMsg); // Throw to be caught by catch block
      }

      const data: EmotionApiResponse = await response.json();

       // Basic validation of received data
       if (typeof data.emotions !== 'object' || data.emotions === null) {
           throw new Error("Invalid emotion data received from server.");
       }

      botMessage = {
        id: botId,
        sender: 'bot',
        emotions: data.emotions,
        timestamp: botTimestamp,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (err) {
      console.error("API call failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage); // Set app-level error if needed, or add error message to chat
      const errorBotMessage: Message = {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          error: `Sorry, I couldn't process that. ${errorMessage}`,
          timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);

    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Main content wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transform transition-all duration-300 ease-in-out relative
        ${!sidebarCollapsed ? 'translate-x-64' : 'translate-x-0'}
        ${settings.theme === 'dark' ? 'text-gray-100 bg-[#0A0A0A]' : 'text-gray-900 bg-white'}`}>
        
        {/* Fixed header - make sure it's always clickable */}
        <header className={`transition-all duration-300 ease-in-out shadow-sm flex items-center px-4 h-16 sticky top-0 z-30
          ${settings.theme === 'dark' ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`text-gray-400 focus:outline-none p-2 rounded-full mr-2 transition-colors duration-300
              ${settings.theme === 'dark' 
                ? 'hover:text-gray-200 hover:bg-gray-700' 
                : 'hover:text-gray-600 hover:bg-gray-100'}`}
            aria-label={sidebarCollapsed ? "Open menu" : "Close menu"}
          >
            <svg 
              className="w-6 h-6 transition-transform duration-200"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {sidebarCollapsed ? (
                // Hamburger icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              ) : (
                // Left arrow icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Emotion Detector Chat</h1>
        </header>

        {/* Messages container with flex-grow */}
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} isLoading={isLoading} theme={settings.theme} />
        </div>

        {/* Input area fixed at bottom */}
        <div className="sticky bottom-0 w-full">
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} theme={settings.theme} />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={!sidebarCollapsed}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        chatHistory={chatHistory}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};

export default App;