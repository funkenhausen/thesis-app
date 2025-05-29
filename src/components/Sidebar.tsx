// src/components/Sidebar.tsx
import React from 'react';
import { FiSettings, FiPlus, FiMessageSquare } from 'react-icons/fi';
import { ChatHistoryItem } from '../types'; // Removed SidebarProps as it's defined inline now

// Define SidebarProps directly or ensure it's correctly imported if used elsewhere
interface SidebarProps {
  isOpen: boolean;
  widthClass: string; // Expecting Tailwind width class like "w-64" or "w-72"
  chatHistory: ChatHistoryItem[];
  onOpenSettings: () => void;
  theme: string;
  onStartNewChat: () => void;
  currentChatId: string;
  onSelectChat: (chatId: string) => void;
  onContextMenu: (event: React.MouseEvent, chatId: string) => void;
}


const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  widthClass, // Use the passed width class
  chatHistory,
  onOpenSettings,
  theme,
  onStartNewChat,
  currentChatId,
  onSelectChat,
  onContextMenu,
}) => {

  return (
    <div
      className={`
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        ${widthClass} /* Apply the dynamic width class passed from App.tsx */
        z-40 flex flex-col shadow-lg
        ${theme === 'dark'
          ? 'bg-[#202123] border-r border-[#3E3F4B] text-[#ECECF1]'
          : 'bg-[#F7F7F8] border-r border-[#E5E7EB] text-[#111111]'}
        
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ willChange: 'transform' }}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className={`
        h-16 flex items-center justify-between px-3 sm:px-4 border-b shrink-0
        transition-colors duration-300
        ${theme === 'dark' ? 'border-[#3E3F4B]' : 'border-[#E5E7EB]'}
      `}>
        <h2 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]'}`}>
          Menu
        </h2>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className={`
            p-1.5 sm:p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${theme === 'dark' ? 'text-gray-400 hover:text-white focus:ring-[#10A37F] focus:ring-offset-[#202123]' : 'text-gray-500 hover:text-black focus:ring-[#10A37F] focus:ring-offset-[#F7F7F8]'}
          `}
        >
          <FiSettings size={18} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 sm:p-4 shrink-0">
        <button
          onClick={onStartNewChat}
          className={`
            w-full flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-lg font-medium text-xs sm:text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
            ${theme === 'dark'
              ? 'bg-[#3E3F4B] hover:bg-[#4A4B59] text-white focus:ring-[#10A37F] focus:ring-offset-[#202123]'
              : 'bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111111] focus:ring-[#10A37F] focus:ring-offset-[#F7F7F8]'}`}
        >
          <FiPlus size={16} strokeWidth={2.5}/>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-1.5 sm:px-2 py-2">
          <h3 className={`text-[0.7rem] sm:text-xs font-semibold uppercase mb-1.5 sm:mb-2 px-1.5 sm:px-2 ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
            Recent Chats
          </h3>
          <ul className="space-y-0.5 sm:space-y-1">
            {chatHistory.length === 0 && (
              <li className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs sm:text-sm ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                No chats yet.
              </li>
            )}
            {chatHistory.map((chat) => (
              <li key={chat.id}>
                <div
                  onClick={() => onSelectChat(chat.id)}
                  onContextMenu={(e) => onContextMenu(e, chat.id)}
                  className={`
                    w-full text-left p-2 sm:p-2.5 rounded-lg flex items-center gap-2 sm:gap-3
                    focus:outline-none focus:ring-1 focus:ring-inset transition-colors duration-150 cursor-pointer
                    ${currentChatId === chat.id
                      ? (theme === 'dark' ? 'bg-[#3E3F4B] text-white' : 'bg-[#D1D5DB] text-black')
                      : (theme === 'dark' ? 'hover:bg-[#343541] focus:bg-[#343541] focus:ring-[#565869]' : 'hover:bg-[#E5E7EB] focus:bg-[#E5E7EB] focus:ring-[#A1A1AA]')
                    }`}
                >
                  <FiMessageSquare size={14} />
                  <div className="flex-1 overflow-hidden">
                    <p className={`truncate text-xs sm:text-sm font-medium ${currentChatId === chat.id ? (theme === 'dark' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]')}`}>
                        {chat.title || 'New Chat'}
                    </p>
                    <p className={`text-[0.7rem] sm:text-xs truncate ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                      {chat.lastMessage || '...'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default Sidebar;