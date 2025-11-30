import React, { useState } from 'react';
import { Key, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ApiKeyDialogProps {
  onSubmit: (apiKey: string) => void;
  currentKey?: string | null;
  language: 'ja' | 'en';
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onSubmit, currentKey, language }) => {
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    const trimmedKey = inputKey.trim();
    if (trimmedKey) {
      onSubmit(trimmedKey);
    }
  };

  const text = {
    ja: {
      title: 'APIキー設定',
      description: 'このツールを使用するには、あなた自身のGemini APIキーが必要です。',
      getKey: 'Google AI StudioでAPIキーを取得（無料）',
      placeholder: 'AIza... で始まるAPIキーを入力',
      save: '保存して開始',
      current: '現在のキー',
      change: '変更',
      warning: '※ APIキーはブラウザのlocalStorageに保存されます。',
      free: '無料枠: 1日あたり1,500リクエスト',
    },
    en: {
      title: 'API Key Setup',
      description: 'You need your own Gemini API key to use this tool.',
      getKey: 'Get API Key from Google AI Studio (Free)',
      placeholder: 'Enter API key starting with AIza...',
      save: 'Save and Start',
      current: 'Current Key',
      change: 'Change',
      warning: '* API key is stored in browser localStorage.',
      free: 'Free tier: 1,500 requests/day',
    }
  };

  const t = text[language];

  return (
    <div className="bg-white border-4 border-black p-6 space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <Key size={32} className="text-yellow-600" />
        <h2 className="text-2xl font-bold">{t.title}</h2>
      </div>

      <p className="text-sm text-gray-700 bg-blue-50 border-2 border-blue-300 p-3">
        {t.description}
      </p>

      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-500 text-white font-bold px-4 py-3 hover:bg-blue-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] justify-center"
      >
        {t.getKey}
        <ExternalLink size={16} />
      </a>

      <div className="space-y-2">
        <label className="text-sm font-bold flex items-center gap-2">
          <Key size={16} />
          API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder={t.placeholder}
            className="w-full p-3 border-4 border-gray-300 focus:border-black font-mono text-sm pr-20"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-200 px-2 py-1 border-2 border-gray-400 hover:bg-gray-300"
          >
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!inputKey.trim()}
        className="w-full py-3"
      >
        {t.save}
      </Button>

      <div className="flex items-start gap-2 bg-yellow-50 border-2 border-yellow-400 p-3 text-xs">
        <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-gray-700">
          <p>{t.warning}</p>
          <p className="font-bold text-green-600">{t.free}</p>
        </div>
      </div>
    </div>
  );
};
