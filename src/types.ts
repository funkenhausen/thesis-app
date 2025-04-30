// src/types.ts

export type EmotionData = {
  [key: string]: number; // e.g., { "Happiness": 0.95, "Sadness": 0.12 }
};

export interface Message {
  id: string; // Unique ID for React key prop
  sender: 'user' | 'bot';
  text?: string; // User's input text
  emotions?: Record<string, number>; // Bot's emotion analysis
  timestamp: number; // For potential ordering or display
  error?: string; // Optional error message for bot response
}

export interface EmotionApiResponse {
  emotions: EmotionData;
}

export interface EmotionApiErrorResponse {
  error: string;
}

// Renamed Chat to ChatHistoryItem for clarity in App.tsx state
export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string; // Preview text for the sidebar
  messages: Message[]; // The actual messages of this chat
  timestamp: number; // Timestamp of the last activity in this chat
}

export interface AppSettings {
  theme: 'dark' | 'light';
  apiUrl: string;
  // Add more settings as needed
}

// Updated SidebarProps
export interface SidebarProps {
  isOpen: boolean;
  onOpenSettings: () => void;
  chatHistory: ChatHistoryItem[];
  theme: 'dark' | 'light';
  onStartNewChat: () => void;         // Callback to start a new chat
  currentChatId: string;              // ID of the currently active chat
  onSelectChat: (chatId: string) => void; // Callback when a chat is selected
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  theme: 'dark' | 'light';
}

export interface InputAreaProps {
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  theme: 'dark' | 'light';
}

// Chat type is essentially ChatHistoryItem now, kept for potential separate use later if needed
// export interface Chat extends ChatHistoryItem {}