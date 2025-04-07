import React from 'react';
import { ChatHistoryItem, AppSettings, SidebarProps } from '../types';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  chatHistory,
  settings,
  onSettingsChange,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out w-64
        shadow-md
        ${settings.theme === 'dark' 
          ? 'bg-gray-900 border-r border-gray-800 text-gray-100' 
          : 'bg-white border-r border-gray-200 text-gray-900'}
        ${!isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      style={{ 
        willChange: 'transform'
      }}
    >
      {/* Header */}
      <div className={`h-16 border-b transition-colors duration-300 ${settings.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="h-full px-4 flex items-center">
          <h2 className={`text-xl font-bold ${settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            Menu
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        {!isCollapsed && (
          <>
            {/* Chat History Section */}
            <div className="p-4">
              <h3 className={`text-sm font-semibold uppercase ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Recent Chats
              </h3>
              <div className="mt-2 space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-2 rounded cursor-pointer ${
                      settings.theme === 'dark' 
                        ? 'hover:bg-gray-800 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium">{chat.title}</div>
                    <div className={`text-xs ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      {chat.lastMessage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Section */}
            <div className={`p-4 border-t ${settings.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Settings
              </h3>
              <div className="mt-2 space-y-3">
                {/* Theme selector */}
                <div className="flex items-center justify-between">
                  <span className={settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Theme</span>
                  <select
                    value={settings.theme}
                    onChange={(e) => onSettingsChange({ ...settings, theme: e.target.value as 'dark' | 'light' })}
                    className={`rounded border text-sm px-2 py-1 shadow-none ${
                      settings.theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                {/* API URL input */}
                <div className="flex items-center justify-between">
                  <span className={settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>API URL</span>
                  <input
                    type="text"
                    value={settings.apiUrl}
                    onChange={(e) => onSettingsChange({ ...settings, apiUrl: e.target.value })}
                    className={`rounded border px-2 py-1 text-sm w-36 ${
                      settings.theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
