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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"> {/* Increased z-index */}
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" // Enhanced backdrop
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal box */}
      <div
        className={`relative z-50 w-full max-w-md p-6 rounded-xl shadow-2xl transition-colors duration-300
          ${settings.theme === 'dark'
            ? 'bg-[#343541] text-[#ECECF1]'
            : 'bg-[#FFFFFF] text-[#111111]'}`}
        role="dialog" // Accessibility roles
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* header */}
        <div className="flex items-center justify-between mb-6"> {/* Increased margin */}
          <h2 id="settings-title" className="text-xl font-semibold">Settings</h2> {/* Increased size */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
              ${settings.theme === 'dark' ? 'text-gray-400 hover:text-white focus:ring-[#10A37F] focus:ring-offset-[#343541]' : 'text-gray-500 hover:text-black focus:ring-[#10A37F] focus:ring-offset-white'}`}
          >
            <FiX size={24} /> {/* Increased icon size */}
          </button>
        </div>

        {/* theme selector */}
        <div className="mb-5"> {/* Consistent margin */}
          <label htmlFor="theme-select" className="block mb-2 font-medium text-sm">Theme</label> {/* Adjusted label */}
          <select
            id="theme-select"
            value={settings.theme}
            onChange={e =>
              onSettingsChange({ ...settings, theme: e.target.value as 'dark' | 'light' })
            }
            className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#10A37F] transition-colors duration-200
              ${settings.theme === 'dark'
                ? 'bg-[#202123] border-[#3E3F4B] text-[#ECECF1]'
                : 'bg-[#F7F7F8] border-[#E5E7EB] text-[#111111]'}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* API URL */}
        <div className="mb-6"> {/* Consistent margin */}
          <label htmlFor="api-url-input" className="block mb-2 font-medium text-sm">API URL</label> {/* Adjusted label */}
          <input
            id="api-url-input"
            type="text"
            value={settings.apiUrl}
            onChange={e =>
              onSettingsChange({ ...settings, apiUrl: e.target.value })
            }
            placeholder="http://localhost:5000/predict" // Added placeholder
            className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#10A37F] transition-colors duration-200
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
            className={`px-5 py-2 rounded-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
              ${settings.theme === 'dark'
                ? 'bg-[#10A37F] hover:bg-[#0E8C6E] focus:ring-[#10A37F] focus:ring-offset-[#343541]'
                : 'bg-[#10A37F] hover:bg-[#0E8C6E] focus:ring-[#10A37F] focus:ring-offset-white'}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;