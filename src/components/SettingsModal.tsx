// src/components/SettingsModal.tsx
import React, { FC } from 'react';
import { AppSettings } from '../types';
import { FiX } from 'react-icons/fi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* modal box */}
      <div
        className={`relative z-40 w-80 max-w-full p-6 rounded-2xl shadow-2xl transition-colors duration-300
          ${settings.theme === 'dark'
            ? 'bg-[#343541] text-[#ECECF1]'
            : 'bg-[#FFFFFF] text-[#111111]'}`}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="focus:outline-none"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* theme selector */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Theme</label>
          <select
            value={settings.theme}
            onChange={e =>
              onSettingsChange({ ...settings, theme: e.target.value as 'dark' | 'light' })
            }
            className={`w-full rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#10A37F]
              ${settings.theme === 'dark'
                ? 'bg-[#202123] border-[#3E3F4B] text-[#ECECF1]'
                : 'bg-[#F7F7F8] border-[#E5E7EB] text-[#111111]'}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* API URL */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">API URL</label>
          <input
            type="text"
            value={settings.apiUrl}
            onChange={e =>
              onSettingsChange({ ...settings, apiUrl: e.target.value })
            }
            className={`w-full rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#10A37F]
              ${settings.theme === 'dark'
                ? 'bg-[#202123] border-[#3E3F4B] text-[#ECECF1]'
                : 'bg-[#F7F7F8] border-[#E5E7EB] text-[#111111]'}`}
          />
        </div>

        {/* close button */}
        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-white focus:outline-none transition-colors duration-200
              ${settings.theme === 'dark'
                ? 'bg-[#10A37F] hover:bg-[#0E8C6E]'
                : 'bg-[#10A37F] hover:bg-[#0E8C6E]'}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
