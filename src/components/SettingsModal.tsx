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

// Simple Toggle Switch Component
const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme: 'dark' | 'light';
  idSuffix?: string; // To ensure unique IDs if multiple toggles
}> = ({ label, checked, onChange, theme, idSuffix ="" }) => {
  const uniqueId = `${label.replace(/\s+/g, '-').toLowerCase()}${idSuffix}`;
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <label htmlFor={uniqueId} className="block font-medium text-sm">
        {label}
      </label>
      <button
        id={uniqueId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${checked ? 'bg-[#10A37F]' : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200')}
          ${theme === 'dark' ? 'focus:ring-offset-[#343541]' : 'focus:ring-offset-white'}
          focus:ring-[#10A37F]`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform 
            ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};


const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-50 w-full max-w-md p-6 rounded-xl shadow-2xl transition-colors duration-300
          ${settings.theme === 'dark'
            ? 'bg-[#343541] text-[#ECECF1]'
            : 'bg-[#FFFFFF] text-[#111111]'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="settings-title" className="text-xl font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
              ${settings.theme === 'dark' ? 'text-gray-400 hover:text-white focus:ring-[#10A37F] focus:ring-offset-[#343541]' : 'text-gray-500 hover:text-black focus:ring-[#10A37F] focus:ring-offset-white'}`}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-5">
          <label htmlFor="theme-select" className="block mb-2 font-medium text-sm">Theme</label>
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

        <div className="mb-6">
          <label htmlFor="api-url-input" className="block mb-2 font-medium text-sm">API URL</label>
          <input
            id="api-url-input"
            type="text"
            value={settings.apiUrl}
            onChange={e =>
              onSettingsChange({ ...settings, apiUrl: e.target.value })
            }
            placeholder="http://localhost:5000/predict"
            className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#10A37F] transition-colors duration-200
              ${settings.theme === 'dark'
                ? 'bg-[#202123] border-[#3E3F4B] text-[#ECECF1]'
                : 'bg-[#F7F7F8] border-[#E5E7EB] text-[#111111]'}`}
          />
        </div>

        {/* Show Model Analysis Toggle */}
        <div className="mb-6">
          <ToggleSwitch
            label="Show Model Analysis"
            checked={settings.showModelAnalysis}
            onChange={(isChecked) => 
              onSettingsChange({ ...settings, showModelAnalysis: isChecked })
            }
            theme={settings.theme}
            idSuffix="-model-analysis" // Added for unique ID
          />
        </div>

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