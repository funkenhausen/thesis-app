// src/components/Sidebar.tsx
import React from 'react'; // Added React import
import { FiChevronLeft, FiChevronRight, FiSettings, FiClock, FiPlus } from 'react-icons/fi';
import { ChatHistoryItem, SidebarProps } from '../types'; // Import SidebarProps from types.ts

// Use the imported SidebarProps interface
const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  // isCollapsed prop is removed, isOpen controls visibility
  // onToggleCollapse prop is removed, handled in App.tsx
  chatHistory,
  onOpenSettings,
  theme,
  onStartNewChat,
  currentChatId,
  onSelectChat,
  onContextMenu, // Added onContextMenu prop
  
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out w-64 z-40 flex flex-col shadow-lg
        ${theme === 'dark'
          ? 'bg-[#202123] border-r border-[#3E3F4B] text-[#ECECF1]'
          : 'bg-[#F7F7F8] border-r border-[#E5E7EB] text-[#111111]'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ willChange: 'transform' }}
      aria-hidden={!isOpen} // Accessibility: hide when closed
    >
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b shrink-0 transition-colors duration-300
        ${theme === 'dark' ? 'border-[#3E3F4B]' : 'border-[#E5E7EB]'}`}
      >
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]'}`}>Menu</h2>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${theme === 'dark' ? 'text-gray-400 hover:text-white focus:ring-[#10A37F] focus:ring-offset-[#202123]' : 'text-gray-500 hover:text-black focus:ring-[#10A37F] focus:ring-offset-[#F7F7F8]'}`}
        >
          <FiSettings size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 shrink-0">
        <button
          onClick={onStartNewChat}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
            ${theme === 'dark'
              ? 'bg-[#3E3F4B] hover:bg-[#4A4B59] text-white focus:ring-[#10A37F] focus:ring-offset-[#202123]'
              : 'bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111111] focus:ring-[#10A37F] focus:ring-offset-[#F7F7F8]'}`}
        >
          <FiPlus size={18} strokeWidth={2.5}/>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History - Removed opacity logic based on isCollapsed */}
      <div className="flex-1 overflow-y-auto px-2 py-2"> {/* Adjusted padding */}
          <h3 className={`text-xs font-semibold uppercase mb-2 px-2 ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>Recent Chats</h3>
          <ul className="space-y-1">
            {chatHistory.length === 0 && (
              <li className={`px-2 py-2 text-sm ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                No chats yet.
              </li>
            )}
            {chatHistory.map((chat) => (
              <li key={chat.id}>
                <div
                  onClick={() => onSelectChat(chat.id)}
                  onContextMenu={(e) => onContextMenu(e, chat.id)} // Added onContextMenu handler
                  // Apply selected styles based on currentChatId
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 focus:outline-none focus:ring-1 focus:ring-inset transition-colors duration-150
                    ${currentChatId === chat.id
                      ? (theme === 'dark' ? 'bg-[#3E3F4B] text-white' : 'bg-[#D1D5DB] text-black') // Active state
                      : (theme === 'dark' ? 'hover:bg-[#343541] focus:bg-[#343541] focus:ring-[#565869]' : 'hover:bg-[#E5E7EB] focus:bg-[#E5E7EB] focus:ring-[#A1A1AA]') // Hover/focus state
                    }`}
                >
                  <FiClock size={16} className="shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className={`truncate text-sm font-medium ${currentChatId === chat.id ? (theme === 'dark' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]')}`}>
                        {chat.title || 'New Chat'} {/* Fallback title */}
                    </p>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                      {chat.lastMessage || '...'} {/* Fallback last message */}
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