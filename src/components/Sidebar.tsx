// src/components/Sidebar.tsx
import React from 'react';
import { ChatHistoryItem, SidebarProps } from '../types';
import { FiChevronLeft, FiChevronRight, FiSettings, FiClock } from 'react-icons/fi';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  chatHistory,
  onOpenSettings,
  theme,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out w-64 z-20 flex flex-col
        ${theme === 'dark'
          ? 'bg-[#202123] border-r border-[#3E3F4B] text-[#ECECF1]'
          : 'bg-[#F7F7F8] border-r border-[#E5E7EB] text-[#111111]'}
        ${!isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b transition-colors duration-300
        ${theme === 'dark' ? 'border-[#3E3F4B]' : 'border-[#E5E7EB]'}`}
      >
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]'}`}>Menu</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Toggle collapse"
            className="focus:outline-none"
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="focus:outline-none"
          >
            <FiSettings size={20} />
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className={`flex-1 overflow-y-auto transition-opacity duration-300
        ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        <div className="p-4">
          <h3 className={`text-xs font-medium uppercase mb-2 ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>Recent Chats</h3>
          <ul className="space-y-1">
            {chatHistory.map((chat: ChatHistoryItem) => (
              <li key={chat.id}>
                <button
                  type="button"
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors duration-200
                    ${theme === 'dark'
                      ? 'hover:bg-[#343541]'
                      : 'hover:bg-[#FFFFFF]'}
                  `}
                >
                  <FiClock size={16} className={theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'} />
                  <div className="flex flex-col truncate">
                    <span className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-[#ECECF1]' : 'text-[#111111]'}`}>{chat.title}</span>
                    <span className={`text-xs truncate ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>{chat.lastMessage}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
