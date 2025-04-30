// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Message, EmotionApiResponse, EmotionApiErrorResponse, AppSettings, ChatHistoryItem } from './types'; // Ensure EmotionApiResponse reflects the new structure if defined there
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import { FiMenu, FiX } from 'react-icons/fi';

// --- Default Configuration ---
const DEFAULT_API_URL = 'http://127.0.0.1:5000/predict';
const DEFAULT_INITIAL_MESSAGE: Message = {
  id: 'init-bot-msg-default',
  sender: 'bot',
  // Represent initial message with an 'Info' type or similar if needed
  // emotions: { Info: 1.0 },
  text: "Hello! Tell me something and I'll try to guess the emotion.",
  timestamp: Date.now(),
};
// ---------------------

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Define interface for the expected API response structure (new version)
interface FullEmotionApiResponse {
    predictions: { [key: string]: number }; // Object with all emotion scores
    predicted_emotion: string;             // Top emotion name
    confidence: number;                    // Top emotion confidence
}


const App: React.FC = () => {
  // --- State --- (Keep existing state definitions)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('emotionChatSettings');
    return savedSettings ? JSON.parse(savedSettings) : { theme: 'dark', apiUrl: DEFAULT_API_URL };
  });

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('emotionChatHistory');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].messages) {
               return parsed;
            }
        } catch (e) { console.error("Failed to parse chat history:", e); }
    }
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
    if (savedCurrentId && chatHistory.some(chat => chat.id === savedCurrentId)) {
      return savedCurrentId;
    }
    return chatHistory[0]?.id || '';
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    return currentChat?.messages || [DEFAULT_INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);


  // --- Effects --- (Keep existing useEffect hooks)
  useEffect(() => {
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#343541' : '#FFFFFF';
    localStorage.setItem('emotionChatSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('emotionChatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('emotionChatCurrentId', currentChatId);
  }, [chatHistory, currentChatId]);

   useEffect(() => {
     const currentChat = chatHistory.find(chat => chat.id === currentChatId);
     setMessages(currentChat?.messages || [DEFAULT_INITIAL_MESSAGE]);
     setError(null);
     setIsLoading(false);
   }, [currentChatId, chatHistory]);


  // --- Callbacks ---
  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentChatId) {
        console.error("Cannot send message: No current chat selected.");
        setError("No chat selected. Please start a new chat or select one.");
        return;
    }

    const userMessage: Message = { id: generateId(), sender: 'user', text, timestamp: Date.now() };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

     const updateHistory = (newMessage: Message) => {
       setChatHistory(prevHistory => {
           const historyCopy = [...prevHistory];
           const chatIndex = historyCopy.findIndex(chat => chat.id === currentChatId);
           if (chatIndex !== -1) {
               const updatedChat = { ...historyCopy[chatIndex] };
               updatedChat.messages = [...(updatedChat.messages || []), newMessage];
               if (newMessage.sender === 'user') {
                   updatedChat.lastMessage = newMessage.text ?? '...';
               }
               updatedChat.timestamp = newMessage.timestamp;
               historyCopy[chatIndex] = updatedChat;
               // Sort history by timestamp descending after update
               // return historyCopy.sort((a, b) => b.timestamp - a.timestamp); // Optional: Keep most recent chat first in sidebar
               return historyCopy;
           }
           return prevHistory;
       });
     };

     updateHistory(userMessage);

    try {
      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          // Assuming EmotionApiErrorResponse is { error: string }
          const errorData: EmotionApiErrorResponse = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }

      // ***** MODIFICATION START *****
      // Parse the JSON response which now contains the full predictions object
      const data: FullEmotionApiResponse = await response.json();

      // Validate the *new* structure received from Flask
      if (!data.predictions || typeof data.predictions !== 'object' || data.predictions === null ||
          !data.predicted_emotion || typeof data.predicted_emotion !== 'string' ||
          typeof data.confidence !== 'number') {
        console.error("Invalid data structure received:", data);
        throw new Error('Invalid prediction data received from server. Expected "predictions" object, "predicted_emotion" string, and "confidence" number.');
      }

      // Create the bot message using the FULL predictions object from the API
      const botMessage: Message = {
          id: generateId(),
          sender: 'bot',
          emotions: data.predictions, // <-- Use the whole predictions object here
          timestamp: Date.now(),
           // Optional: You can still add a text field summarizing the top emotion,
           // or remove it if the MessageList component will visualize the emotions directly.
           text: `Top Emotion: ${data.predicted_emotion} (${(data.confidence * 100).toFixed(1)}%)`
      };
      // ***** MODIFICATION END *****

      setMessages(prev => [...prev, botMessage]);
      updateHistory(botMessage);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("API Fetch Error:", err);
      setError(`Failed to get response: ${msg}`);
      const errorBotMessage: Message = { id: generateId(), sender: 'bot', error: `Sorry, I couldn't process that. ${msg}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorBotMessage]);
      updateHistory(errorBotMessage);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiUrl, currentChatId, setChatHistory]); // Keep dependencies

  const startNewChat = useCallback(() => {
    const newChat: ChatHistoryItem = {
      id: generateId(),
      title: `Chat ${chatHistory.length + 1}`,
      lastMessage: '',
      messages: [DEFAULT_INITIAL_MESSAGE],
      timestamp: Date.now(),
    };
    setChatHistory(prev => [newChat, ...prev.sort((a, b) => b.timestamp - a.timestamp)]); // Add and ensure sort
    setCurrentChatId(newChat.id);
    setError(null);
    setSidebarOpen(false);
  }, [chatHistory.length, setChatHistory]);

  const handleSelectChat = useCallback((chatId: string) => {
    if (chatId !== currentChatId) {
      setCurrentChatId(chatId);
      setSidebarOpen(false);
    }
  }, [currentChatId]);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);


  // --- Render --- (Keep existing render structure)
  return (
    <div className={`h-screen flex overflow-hidden ${settings.theme}`}>

       <Sidebar
          isOpen={sidebarOpen}
          onOpenSettings={() => setSettingsOpen(true)}
          // Sort chat history by timestamp for display in sidebar
          chatHistory={chatHistory.slice().sort((a, b) => b.timestamp - a.timestamp)}
          theme={settings.theme}
          onStartNewChat={startNewChat}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
        />

      {/* Main chat area */}
       <div
        className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} ${settings.theme === 'dark' ? 'text-[#ECECF1] bg-[#343541]' : 'text-[#111111] bg-[#FFFFFF]'}`}
      >
        {/* Header */}
        <header
          className={`shadow-sm flex items-center px-4 h-16 sticky top-0 z-30 shrink-0 transition-colors duration-300 ${settings.theme === 'dark' ? 'bg-[#343541] border-b border-[#3E3F4B]' : 'bg-[#FFFFFF] border-b border-[#E5E7EB]'}`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            type="button"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            className={`p-2 rounded-full mr-3 focus:outline-none focus:ring-2 focus:ring-inset transition-colors duration-200 ${settings.theme === 'dark' ? 'text-[#A1A1AA] hover:text-[#ECECF1] hover:bg-[#444654] focus:ring-[#10A37F]' : 'text-[#52525B] hover:text-[#111111] hover:bg-[#F0F0F0] focus:ring-[#10A37F]'}`}
          >
             {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-semibold truncate">
            {chatHistory.find(c => c.id === currentChatId)?.title || 'Emotion Detector Chat'}
          </h1>
        </header>

        {/* Message List */}
        <div className={`flex-1 overflow-y-auto ${settings.theme === 'dark' ? 'bg-[#202123]' : 'bg-[#F7F7F8]'}`}>
            {/* Pass the potentially sorted messages if needed, though order usually comes from state */}
            <MessageList messages={messages} isLoading={isLoading} theme={settings.theme} />
        </div>

         {/* Input Area */}
         <div className="sticky bottom-0 w-full shrink-0">
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