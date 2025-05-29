// src/components/ChatContextMenu.tsx
import React from 'react';

interface ChatContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  theme: string;
}

const ChatContextMenu: React.FC<ChatContextMenuProps> = ({ x, y, onRename, onDelete, theme }) => {
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 1000, // Ensure it's above the mobile overlay (z-30)
  };

  const menuClass = `rounded-lg shadow-xl p-1 min-w-[150px] sm:min-w-[160px] ${ // Slightly smaller min-width for mobile
    theme === 'dark'
      ? 'bg-[#2D2D2D] border border-[#3E3F4B]'
      : 'bg-white border border-gray-200'
  }`;

  const itemClass = `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md cursor-pointer ${
    theme === 'dark'
      ? 'hover:bg-[#3E3F4B] text-gray-200'
      : 'hover:bg-gray-100 text-gray-700'
  }`;

  return (
    <div className={menuClass} style={menuStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent click on menu from closing it via App's listener */}
      <div className={itemClass} onClick={onRename}>
        Rename
      </div>
      <div className={`${itemClass} ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`} onClick={onDelete}>
        Delete
      </div>
    </div>
  );
};

export default ChatContextMenu;