// src/types.ts

export type EmotionData = {
  [key: string]: number;
};

export interface AnalysisData {
  type: string;
  details?: string;
  influential_features?: { feature: string; score: number }[];
  token_scores?: { token: string; score: number }[];
  token_emotion_contributions?: { token: string; emotion_scores: Record<string, number> };
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  emotions?: Record<string, number>;
  timestamp: number;
  error?: string;
  analysis?: AnalysisData;
  modelArchitecture?: 'Bidirectional' | 'Unidirectional (feature-based)';
}

export interface EmotionApiErrorResponse {
  error: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  messages: Message[];
  timestamp: number;
}

export type ModelType = 'bert' | 'naive_bayes';
export interface AppSettings {
  theme: 'dark' | 'light';
  apiUrl: string;
  modelType: ModelType;
  showModelAnalysis: boolean; // Added this line
}

export interface SidebarProps {
  isOpen: boolean;
  onOpenSettings: () => void;
  chatHistory: ChatHistoryItem[];
  theme: 'dark' | 'light';
  onStartNewChat: () => void;
  currentChatId: string;
  onSelectChat: (chatId: string) => void;
  onContextMenu: (e: React.MouseEvent, chatId: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  theme: 'dark' | 'light';
  showModelAnalysis: boolean; // Added this line
}

export interface InputAreaProps {
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  theme: 'dark' | 'light';
}