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
    zIndex: 1000,
  };

  const menuClass = `rounded-lg shadow-lg p-1 min-w-[160px] ${
    theme === 'dark' 
      ? 'bg-[#2D2D2D] border border-[#3E3F4B]' 
      : 'bg-white border border-gray-200'
  }`;

  const itemClass = `px-4 py-2 text-sm rounded-md cursor-pointer ${
    theme === 'dark'
      ? 'hover:bg-[#3E3F4B] text-gray-200'
      : 'hover:bg-gray-100 text-gray-700'
  }`;

  return (
    <div className={menuClass} style={menuStyle}>
      <div className={itemClass} onClick={onRename}>
        Rename
      </div>
      <div className={`${itemClass} text-red-500`} onClick={onDelete}>
        Delete
      </div>
    </div>
  );
};

export default ChatContextMenu;
