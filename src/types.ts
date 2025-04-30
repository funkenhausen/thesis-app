// src/types.ts

export type EmotionData = {
  [key: string]: number; // e.g., { "Happiness": 0.95, "Sadness": 0.12 }
};

export interface Message {
  id: string; // Unique ID for React key prop
  sender: 'user' | 'bot';
  text?: string; // User's input text
  emotions?: EmotionData; // Bot's emotion analysis
  timestamp: number; // For potential ordering or display
  error?: string; // Optional error message for bot response
}

export interface EmotionApiResponse {
  emotions: EmotionData;
}

// Or if the API might return an error structure:
export interface EmotionApiErrorResponse {
  error: string;
}

export type ChatHistoryItem = Chat;

export interface AppSettings {
  theme: 'dark' | 'light';
  apiUrl: string;
  // Add more settings as needed
}

export interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;         // Trigger settings modal
  chatHistory: ChatHistoryItem[];
  theme: 'dark' | 'light';            // Pass theme separately
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

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp?: number;
}
