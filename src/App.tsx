// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Message, EmotionApiResponse, EmotionApiErrorResponse, AppSettings, ChatHistoryItem } from './types';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import { FiMenu, FiX } from 'react-icons/fi'; // Using FiMenu/FiX for toggle button

// --- Default Configuration ---
const DEFAULT_API_URL = 'http://127.0.0.1:5000/predict'; // Example URL
const DEFAULT_INITIAL_MESSAGE: Message = {
  id: 'init-bot-msg-default',
  sender: 'bot',
  emotions: { Info: 1.0 },
  text: "Hello! Tell me something and I'll try to guess the emotion.",
  timestamp: Date.now(),
};
// ---------------------

// Helper to generate a simple unique ID
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Lazy initializer to load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('emotionChatSettings');
    return savedSettings ? JSON.parse(savedSettings) : { theme: 'dark', apiUrl: DEFAULT_API_URL };
  });

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
     // Lazy initializer for chat history
    const savedHistory = localStorage.getItem('emotionChatHistory');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            // Basic validation
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].messages) {
               return parsed;
            }
        } catch (e) { console.error("Failed to parse chat history:", e); }
    }
    // Default history if none saved or parsing failed
    return [{
        id: generateId(),
        title: 'First Chat',
        lastMessage: DEFAULT_INITIAL_MESSAGE.text ?? '',
        messages: [DEFAULT_INITIAL_MESSAGE],
        timestamp: Date.now(),
    }];
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    const savedCurrentId = localStorage.getItem('emotionChatCurrentId');
    // Ensure the saved ID actually exists in the loaded history
    if (savedCurrentId && chatHistory.some(chat => chat.id === savedCurrentId)) {
      return savedCurrentId;
    }
    return chatHistory[0]?.id || ''; // Fallback to the first chat ID or empty
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages based on the current chat
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    return currentChat?.messages || [DEFAULT_INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error specific to the current chat operation
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Changed state name for clarity
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);


  // --- Effects ---
  // Update body background color on theme change
  useEffect(() => {
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#343541' : '#FFFFFF';
    // Save settings to localStorage
    localStorage.setItem('emotionChatSettings', JSON.stringify(settings));
  }, [settings]);

  // Save chat history and current chat ID to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emotionChatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('emotionChatCurrentId', currentChatId);
  }, [chatHistory, currentChatId]);

  // Load messages when the current chat ID changes
   useEffect(() => {
     const currentChat = chatHistory.find(chat => chat.id === currentChatId);
     setMessages(currentChat?.messages || [DEFAULT_INITIAL_MESSAGE]);
     setError(null); // Clear errors when switching chats
     setIsLoading(false); // Reset loading state
   }, [currentChatId, chatHistory]); // Depend on both


  // --- Callbacks ---
  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentChatId) {
        console.error("Cannot send message: No current chat selected.");
        setError("No chat selected. Please start a new chat or select one.");
        return;
    }

    const userMessage: Message = { id: generateId(), sender: 'user', text, timestamp: Date.now() };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

     // Update chat history optimistically (or after API call)
     const updateHistory = (newMessage: Message) => {
       setChatHistory(prevHistory => {
           const historyCopy = [...prevHistory];
           const chatIndex = historyCopy.findIndex(chat => chat.id === currentChatId);
           if (chatIndex !== -1) {
               const updatedChat = { ...historyCopy[chatIndex] };
               // Ensure messages array exists
               updatedChat.messages = [...(updatedChat.messages || []), newMessage];
               // Update last message only if it's the user's message (for preview)
               if (newMessage.sender === 'user') {
                   updatedChat.lastMessage = newMessage.text ?? '...';
               }
               updatedChat.timestamp = newMessage.timestamp; // Update chat timestamp
               historyCopy[chatIndex] = updatedChat;
               return historyCopy;
           }
           return prevHistory; // Return previous state if chat not found
       });
     };

     updateHistory(userMessage); // Add user message to history

    try {
      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData: EmotionApiErrorResponse = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }

      const data: EmotionApiResponse = await response.json();
      if (!data.emotions || typeof data.emotions !== 'object') {
        throw new Error('Invalid emotion data received from server.');
      }

      const botMessage: Message = { id: generateId(), sender: 'bot', emotions: data.emotions, timestamp: Date.now() };
      setMessages(prev => [...prev, botMessage]);
      updateHistory(botMessage); // Add bot message to history

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("API Fetch Error:", err);
      setError(`Failed to get response: ${msg}`); // Set error state for potential display
      const errorBotMessage: Message = { id: generateId(), sender: 'bot', error: `Sorry, I couldn't process that. ${msg}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorBotMessage]);
      updateHistory(errorBotMessage); // Add error message to history
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiUrl, currentChatId, setChatHistory]); // Include setChatHistory in dependencies

  const startNewChat = useCallback(() => {
    const newChat: ChatHistoryItem = {
      id: generateId(),
      title: `Chat ${chatHistory.length + 1}`, // Simple title
      lastMessage: '',
      messages: [DEFAULT_INITIAL_MESSAGE], // Start with the default message
      timestamp: Date.now(),
    };

    setChatHistory(prev => [newChat, ...prev]); // Add to the beginning
    setCurrentChatId(newChat.id); // Switch to the new chat
    // setMessages is handled by the useEffect watching currentChatId
    setError(null);
    setSidebarOpen(false); // Close sidebar after starting new chat
  }, [chatHistory.length, setChatHistory]); // Include dependencies

  const handleSelectChat = useCallback((chatId: string) => {
    if (chatId !== currentChatId) {
      setCurrentChatId(chatId);
      // setMessages is handled by the useEffect watching currentChatId
      setSidebarOpen(false); // Close sidebar on selection
    }
  }, [currentChatId]);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);


  // --- Render ---
  return (
    <div className={`h-screen flex overflow-hidden ${settings.theme}`}> {/* Apply theme class for potential global styles */}

       {/* Sidebar - Conditionally rendered for better performance if complex */}
       <Sidebar
          isOpen={sidebarOpen}
          // No need for isCollapsed prop
          onOpenSettings={() => setSettingsOpen(true)}
          chatHistory={chatHistory}
          theme={settings.theme}
          onStartNewChat={startNewChat}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
        />


      {/* Main chat area */}
           {/* Main chat area */}
           <div
        className={`flex-1 flex flex-col min-w-0 relative // Use transition-all for margin changes
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'ml-64' : 'ml-0'} // <-- ADD THIS LINE: Apply margin-left matching sidebar width (w-64 = 16rem) when open
          ${settings.theme === 'dark' ? 'text-[#ECECF1] bg-[#343541]' : 'text-[#111111] bg-[#FFFFFF]'}`}
      >
        {/* Header (Contains the toggle button, which should now be accessible) */}
        <header
          className={`shadow-sm flex items-center px-4 h-16 sticky top-0 z-30 shrink-0
            transition-colors duration-300
            ${settings.theme === 'dark' ? 'bg-[#343541] border-b border-[#3E3F4B]' : 'bg-[#FFFFFF] border-b border-[#E5E7EB]'}`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(o => !o)} // This button should now work correctly
            type="button"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            className={`p-2 rounded-full mr-3 focus:outline-none focus:ring-2 focus:ring-inset transition-colors duration-200
              ${settings.theme === 'dark' ? 'text-[#A1A1AA] hover:text-[#ECECF1] hover:bg-[#444654] focus:ring-[#10A37F]' : 'text-[#52525B] hover:text-[#111111] hover:bg-[#F0F0F0] focus:ring-[#10A37F]'}`}
          >
             {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-semibold truncate">Emotion Detector Chat</h1>
        </header>

        {/* Message List takes remaining space */}
        <div className={`flex-1 overflow-y-auto ${settings.theme === 'dark' ? 'bg-[#202123]' : 'bg-[#F7F7F8]'}`}>
          <MessageList messages={messages} isLoading={isLoading} theme={settings.theme} />
        </div>

         {/* Input Area sticks to bottom */}
         <div className="sticky bottom-0 w-full shrink-0">
           {/* Display API errors temporarily above input */}
           {error && (
             <div className={`px-4 py-2 text-center text-sm ${settings.theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-700'}`}>
               {error}
             </div>
           )}
           <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} theme={settings.theme} />
        </div>
      </div>


      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default App;