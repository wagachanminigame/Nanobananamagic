import React, { useState } from 'react';
import { Key, ExternalLink, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface ApiKeyDialogProps {
  onSubmit: (apiKey: string, proApiKey?: string) => void;
  currentKey?: string | null;
  currentProKey?: string | null;
  language: 'ja' | 'en';
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onSubmit, currentKey, currentProKey, language }) => {
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [inputProKey, setInputProKey] = useState(currentProKey || '');
  const [showKey, setShowKey] = useState(false);
  const [showProKey, setShowProKey] = useState(false);
  const [isProOpen, setIsProOpen] = useState(!!currentProKey);

  const handleSubmit = () => {
    if (inputKey.trim()) {
      onSubmit(inputKey.trim(), inputProKey.trim() || undefined);
    }
  };

  const t = {
    ja: {
      title: 'API繧ｭ繝ｼ縺ｮ險ｭ螳・,
      desc: 'Google AI Studio縺ｧ蜿門ｾ励＠縺蘗PI繧ｭ繝ｼ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・,
      label: 'Gemini API繧ｭ繝ｼ (辟｡譁呎棧逕ｨ)',
      labelPro: 'Pro API繧ｭ繝ｼ (隱ｲ驥・Pro繝｢繝・Ν逕ｨ)',
      placeholder: 'AIza...',
      link: 'Google AI Studio縺ｧAPI繧ｭ繝ｼ繧貞叙蠕・(辟｡譁・',
      save: '菫晏ｭ倥＠縺ｦ髢句ｧ・,
      current: '迴ｾ蝨ｨ縺ｮ繧ｭ繝ｼ',
      change: '螟画峩',
      warning: 'API繧ｭ繝ｼ縺ｯ繝悶Λ繧ｦ繧ｶ縺ｫ縺ｮ縺ｿ菫晏ｭ倥＆繧後√し繝ｼ繝舌・縺ｫ縺ｯ騾∽ｿ｡縺輔ｌ縺ｾ縺帙ｓ縲・,
      free: '窶ｻ Gemini 1.5 Flash (STD) 縺ｯ辟｡譁呎棧縺ｧ蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｧ縺吶・,
      pro_desc: 'Gemini 1.5 Pro (LEGEND) 繧剃ｽｿ逕ｨ縺吶ｋ蝣ｴ蜷医・縲∝挨騾尿PI繧ｭ繝ｼ繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞縲・,
      toggle_pro: 'Pro繝｢繝・Ν逕ｨ繧ｭ繝ｼ險ｭ螳・(繧ｪ繝励す繝ｧ繝ｳ)',
    },
    en: {
      title: 'Setup API Key',
      desc: 'Please enter your Gemini API Key from Google AI Studio.',
      label: 'Gemini API Key (For Free Tier)',
      labelPro: 'Pro API Key (For Paid/Pro Model)',
      placeholder: 'AIza...',
      link: 'Get API Key from Google AI Studio (Free)',
      save: 'Save & Start',
      current: 'Current Key',
      change: 'Change',
      warning: 'API Key is stored locally in your browser and never sent to our server.',
      free: '* Gemini 1.5 Flash (STD) is available for free.',
      pro_desc: 'To use Gemini 1.5 Pro (LEGEND), please set a separate API key.',
      toggle_pro: 'Pro Model Key Settings (Optional)',
    }
  };

  const text = t[language];

  return (
    <div className="bg-white border-4 border-black p-6 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] max-w-md w-full">
      <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
        <div className="bg-yellow-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Key size={24} className="text-black" />
        </div>
        <h2 className="text-xl font-bold">{text.title}</h2>
      </div>

      <p className="text-sm text-gray-600 font-medium">
        {text.desc}
      </p>

      {/* Standard Key Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {text.label}
          </label>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            {text.link}
            <ExternalLink size={12} />
          </a>
        </div>
        
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            placeholder={text.placeholder}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full border-2 border-black p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-black font-mono text-sm pr-20"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-200 px-2 py-1 border-2 border-gray-400 hover:bg-gray-300"
          >
            {showKey ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </div>

      {/* Pro Key Section (Collapsible) */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsProOpen(!isProOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            {text.toggle_pro}
          </span>
          {isProOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {isProOpen && (
          <div className="p-4 bg-white border-t-2 border-gray-200 space-y-3">
            <p className="text-xs text-gray-500 mb-2">{text.pro_desc}</p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">{text.labelPro}</label>
              <div className="relative">
                <input
                  type={showProKey ? 'text' : 'password'}
                  placeholder={text.placeholder}
                  value={inputProKey}
                  onChange={(e) => setInputProKey(e.target.value)}
                  className="w-full border-2 border-gray-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 font-mono text-sm pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowProKey(!showProKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 px-2 py-1 border border-gray-300 hover:bg-gray-200"
                >
                  {showProKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!inputKey.trim()}
        className="w-full py-3"
      >
        {text.save}
      </Button>

      <div className="flex items-start gap-2 bg-yellow-50 border-2 border-yellow-400 p-3 text-xs">
        <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-gray-700">
          <p>{text.warning}</p>
          <p className="font-bold text-green-600">{text.free}</p>
        </div>
      </div>
    </div>
  );
};