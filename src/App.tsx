// src/App.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Message, AppSettings, ChatHistoryItem, AnalysisData } from './types'; // Added AnalysisData just in case, though not strictly needed here
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ChatContextMenu from './components/ChatContextMenu';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

// --- Default Configuration ---
const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_API_URL = ENV_API_BASE_URL ? `${ENV_API_BASE_URL}/predict` : 'http://127.0.0.1:5001/predict';
console.log("VITE_API_BASE_URL:", ENV_API_BASE_URL);
console.log("DEFAULT_API_URL for app:", DEFAULT_API_URL);
const DEFAULT_MODEL_TYPE = 'bert';
const DEFAULT_SHOW_MODEL_ANALYSIS = true; // Default for showing analysis
const DEFAULT_INITIAL_MESSAGE: Message = {
  id: 'init-bot-msg-default',
  sender: 'bot',
  text: "Hello! Tell me something and I'll try to guess the emotion.",
  timestamp: Date.now(),
};
// ---------------------

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface FullEmotionApiResponse {
    predictions: { [key: string]: number };
    predicted_emotion: string;
    confidence: number;
    model_used: 'bert' | 'naive_bayes';
    analysis?: AnalysisData; 
}

type ModelType = 'bert' | 'naive_bayes';
const AVAILABLE_MODELS: { value: ModelType, label: string }[] = [
    { value: 'bert', label: 'BERT Model' },
    { value: 'naive_bayes', label: 'Naive Bayes Model' },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('emotionChatSettings');
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
    return {
        theme: parsedSettings.theme || 'dark',
        apiUrl: parsedSettings.apiUrl || DEFAULT_API_URL,
        modelType: parsedSettings.modelType || DEFAULT_MODEL_TYPE,
        showModelAnalysis: typeof parsedSettings.showModelAnalysis === 'boolean' 
            ? parsedSettings.showModelAnalysis 
            : DEFAULT_SHOW_MODEL_ANALYSIS, // Initialize new setting
    };
  });

  const [selectedModel, setSelectedModel] = useState<ModelType>(settings.modelType);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState<boolean>(false);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  
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
        title: 'Chat 1',
        lastMessage: DEFAULT_INITIAL_MESSAGE.text ?? '',
        messages: [DEFAULT_INITIAL_MESSAGE],
        timestamp: Date.now(),
    }];
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    const savedCurrentId = localStorage.getItem('emotionChatCurrentId');
    // Ensure chatHistory is defined before using .some
    const initialChatHistory = chatHistory || [];
    const initialChatExists = initialChatHistory.some(chat => chat.id === savedCurrentId);
    if (savedCurrentId && initialChatExists) {
      return savedCurrentId;
    }
    return initialChatHistory[0]?.id || '';
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    // Ensure chatHistory is defined
    const initialChatHistory = chatHistory || [];
    const currentChat = initialChatHistory.find(chat => chat.id === currentChatId);
    return currentChat?.messages || (initialChatHistory.length > 0 ? initialChatHistory[0].messages : [DEFAULT_INITIAL_MESSAGE]);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
  } | null>(null);

  // --- Effects ---
  useEffect(() => {
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#343541' : '#FFFFFF';
    localStorage.setItem('emotionChatSettings', JSON.stringify({
        ...settings, 
        modelType: selectedModel 
    }));
  }, [settings, selectedModel]); 

  useEffect(() => {
    if (chatHistory.length > 0 || localStorage.getItem('emotionChatHistory')) {
        localStorage.setItem('emotionChatHistory', JSON.stringify(chatHistory));
    }
    localStorage.setItem('emotionChatCurrentId', currentChatId);
  }, [chatHistory, currentChatId]);

   useEffect(() => {
     const currentChat = chatHistory.find(chat => chat.id === currentChatId);
     setMessages(currentChat?.messages || (chatHistory.length > 0 ? chatHistory[0]?.messages : [DEFAULT_INITIAL_MESSAGE]));
     setError(null);
     setIsLoading(false);
   }, [currentChatId, chatHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelSelectorRef]);

  // --- Callbacks ---
  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentChatId) {
        console.warn("Attempted to send message without a currentChatId.");
        setError("No chat selected. Please start or select a chat.");
        return;
    }
    const userMessage: Message = { id: generateId(), sender: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
     const updateHistoryWithMessage = (newMessage: Message) => {
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
               return historyCopy.sort((a,b) => b.timestamp - a.timestamp);
           }
           return prevHistory;
       });
     };
     updateHistoryWithMessage(userMessage);
    try {
      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_type: selectedModel }),
      });
      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch { /* Ignore */ }
        throw new Error(errorMsg);
      }
      const data: FullEmotionApiResponse = await response.json();
      if (!data.predictions || typeof data.predictions !== 'object' || !data.predicted_emotion || typeof data.confidence !== 'number' || !data.model_used) {
        console.error("Invalid core data structure received:", data);
        throw new Error('Invalid core prediction data received. Check server response.');
      }
      const modelTypeDisplay = data.model_used === 'bert' ? 'BERT (Bidirectional)' : 'NB (Feature-based)';
      const botMessage: Message = {
          id: generateId(),
          sender: 'bot',
          emotions: data.predictions,
          timestamp: Date.now(),
          text: `Top Emotion (${modelTypeDisplay}): ${data.predicted_emotion} (${(data.confidence * 100).toFixed(1)}%)`,
          analysis: data.analysis,
      };
      setMessages(prev => [...prev, botMessage]);
      updateHistoryWithMessage(botMessage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error.';
      console.error("API Fetch Error:", err);
      setError(`Failed to get response: ${msg}`);
      const errorBotMessage: Message = { id: generateId(), sender: 'bot', error: `Sorry, I couldn't process that. ${msg}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorBotMessage]);
      updateHistoryWithMessage(errorBotMessage);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiUrl, currentChatId, selectedModel, setChatHistory]);

  const startNewChat = useCallback(() => {
    let nextChatNumber = 1;
    const chatNumbers = chatHistory
      .map(chat => {
        const match = chat.title.match(/^Chat (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);
    if (chatNumbers.length > 0) {
      nextChatNumber = Math.max(...chatNumbers) + 1;
    }
    const newChat: ChatHistoryItem = {
      id: generateId(),
      title: `Chat ${nextChatNumber}`,
      lastMessage: '',
      messages: [DEFAULT_INITIAL_MESSAGE],
      timestamp: Date.now(),
    };
    setChatHistory(prev => [newChat, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    setCurrentChatId(newChat.id);
    setError(null);
    setSidebarOpen(false);
  }, [chatHistory]);

  const handleSelectChat = useCallback((chatId: string) => {
    if (chatId !== currentChatId) {
      setCurrentChatId(chatId);
      setSidebarOpen(false);
    }
  }, [currentChatId]);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.modelType) {
        setSelectedModel(newSettings.modelType);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, chatId });
  }, []);

  const handleRenameChat = useCallback(() => {
    if (!contextMenu) return;
    const chatToRename = chatHistory.find(chat => chat.id === contextMenu.chatId);
    if (!chatToRename) return;
    const newTitle = prompt('Enter new chat name:', chatToRename.title);
    if (newTitle && newTitle.trim() !== '') {
      setChatHistory(prev => prev.map(chat =>
        chat.id === contextMenu.chatId ? { ...chat, title: newTitle.trim() } : chat
      ).sort((a,b) => b.timestamp - a.timestamp));
    }
    setContextMenu(null);
  }, [contextMenu, chatHistory]);

  const handleDeleteChat = useCallback(() => {
    if (!contextMenu) return;
    const chatIdToDelete = contextMenu.chatId;
    setContextMenu(null);
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(chat => chat.id !== chatIdToDelete);
        return updatedHistory;
      });
      if (currentChatId === chatIdToDelete) {
         // Re-filter from the latest chatHistory state if possible, or use a state that will update
         // This might still use a slightly stale chatHistory if setChatHistory hasn't completed
         const postDeleteHistory = chatHistory.filter(chat => chat.id !== chatIdToDelete); 
         if (postDeleteHistory.length > 0) {
            setCurrentChatId(postDeleteHistory.sort((a,b) => b.timestamp - a.timestamp)[0].id);
         } else {
            setCurrentChatId(''); // Effect will pick this up
         }
      }
    }
  }, [contextMenu, currentChatId, chatHistory]); // chatHistory dependency is important here

  useEffect(() => {
    if (chatHistory.length === 0 && !isLoading) { // Added !isLoading to prevent race conditions during fast operations
      console.log("Chat history is empty, creating a new default chat ('Chat 1').");
      startNewChat();
    } else if (chatHistory.length > 0 && (!currentChatId || !chatHistory.some(chat => chat.id === currentChatId))) {
      console.log("CurrentChatId is invalid or not set, selecting the most recent chat.");
      setCurrentChatId(chatHistory.sort((a, b) => b.timestamp - a.timestamp)[0].id);
    }
  }, [chatHistory, currentChatId, startNewChat, isLoading]); // Added isLoading

  useEffect(() => {
    const handleClickOutsideContextMenu = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutsideContextMenu);
    return () => document.removeEventListener('click', handleClickOutsideContextMenu);
  }, []);

  const handleModelSelect = (modelValue: ModelType) => {
    setSelectedModel(modelValue);
    setIsModelSelectorOpen(false);
  };

  // --- Render ---
  return (
    <div className={`h-screen flex overflow-hidden ${settings.theme}`}>
      <Sidebar
          isOpen={sidebarOpen}
          onOpenSettings={() => setSettingsOpen(true)}
          chatHistory={chatHistory.slice().sort((a, b) => b.timestamp - a.timestamp)}
          theme={settings.theme}
          onStartNewChat={startNewChat}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onContextMenu={handleContextMenu}
        />

      {contextMenu && (
        <ChatContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
          theme={settings.theme}
        />
      )}

       <div
        className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} ${settings.theme === 'dark' ? 'text-[#ECECF1] bg-[#343541]' : 'text-[#111111] bg-[#FFFFFF]'}`}
      >
        <header
          className={`shadow-sm flex items-center justify-between px-4 h-16 sticky top-0 z-30 shrink-0 transition-colors duration-300 ${settings.theme === 'dark' ? 'bg-[#343541] border-b border-[#3E3F4B]' : 'bg-[#FFFFFF] border-b border-[#E5E7EB]'}`}
        >
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              type="button"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              className={`p-2 rounded-full mr-3 focus:outline-none focus:ring-2 focus:ring-inset transition-colors duration-200 ${settings.theme === 'dark' ? 'text-[#A1A1AA] hover:text-[#ECECF1] hover:bg-[#444654] focus:ring-[#10A37F]' : 'text-[#52525B] hover:text-[#111111] hover:bg-[#F0F0F0] focus:ring-[#10A37F]'}`}
            >
               {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-semibold truncate">
              {currentChatId ? (chatHistory.find(c => c.id === currentChatId)?.title || 'Loading Chat...') : 'Emotion Detector'}
            </h1>
          </div>
          <div className="relative" ref={modelSelectorRef}>
            <button
              onClick={() => setIsModelSelectorOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1
                ${settings.theme === 'dark'
                  ? 'bg-[#202123] text-[#A1A1AA] hover:bg-[#3E3F4B] hover:text-white focus:ring-[#10A37F] focus:ring-offset-[#343541]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-[#10A37F] focus:ring-offset-white'}`}
            >
              <span>{AVAILABLE_MODELS.find(m => m.value === selectedModel)?.label || 'Select Model'}</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} />
            </button>
            {isModelSelectorOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50
                  ${settings.theme === 'dark' ? 'bg-[#2D2D2D] border border-[#3E3F4B]' : 'bg-white ring-1 ring-black ring-opacity-5'}`}
              >
                {AVAILABLE_MODELS.map((model) => (
                  <a
                    key={model.value}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleModelSelect(model.value); }}
                    className={`block px-4 py-2 text-sm 
                      ${selectedModel === model.value
                        ? (settings.theme === 'dark' ? 'bg-[#10A37F] text-white' : 'bg-teal-100 text-teal-700')
                        : (settings.theme === 'dark' ? 'text-gray-300 hover:bg-[#3E3F4B] hover:text-white' : 'text-gray-700 hover:bg-gray-100')
                      }`}
                  >
                    {model.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto ${settings.theme === 'dark' ? 'bg-[#202123]' : 'bg-[#F7F7F8]'}`}>
            <MessageList 
                messages={messages} 
                isLoading={isLoading} 
                theme={settings.theme} 
                showModelAnalysis={settings.showModelAnalysis} // Pass the setting
            />
        </div>

         <div className="sticky bottom-0 w-full shrink-0">
           {error && (
             <div className={`px-4 py-2 text-center text-sm ${settings.theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-700'}`}>
               {error}
             </div>
           )}
           <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} theme={settings.theme} />
        </div>
      </div>

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