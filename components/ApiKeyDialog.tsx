import React, { useState } from 'react';
import { Key, ExternalLink, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ApiKeyDialogProps {
  onSubmit: (apiKey: string, proApiKey?: string) => void;
  currentKey?: string | null;
  currentProKey?: string | null;
  language: 'ja' | 'en';
}

const AI_STUDIO_FREE_LINK = 'https://ai.studio/apps/drive/1fFjmvZbE4HWDvqrfhbLUD8vvICJymf58';

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
      title: 'APIキーの設定',
      desc: '⚠️ 画像生成には有料のAPIキーが必要です。無料で使いたい方は下のボタンからGoogle AI Studioをご利用ください。',
      label: 'Gemini APIキー (有料)',
      labelPro: 'Pro APIキー (課金/Proモデル用)',
      placeholder: 'AIza...',
      link: 'Google AI StudioでAPIキーを取得',
      save: '保存して開始',
      current: '現在のキー',
      change: '変更',
      warning: 'APIキーはブラウザにのみ保存され、サーバーには送信されません。',
      free_title: '🆓 無料で使いたい方はこちら！',
      free_btn: 'Google AI Studio で無料で使う',
      free_note: '※ Googleアカウントでログインして使えます',
      pro_desc: 'Gemini 3 Pro (LEGEND) を使用する場合は、別途APIキーを設定してください。',
      toggle_pro: 'Proモデル用キー設定 (オプション)',
    },
    en: {
      title: 'Setup API Key',
      desc: '⚠️ Image generation requires a paid API key. For free usage, please use Google AI Studio via the button below.',
      label: 'Gemini API Key (Paid)',
      labelPro: 'Pro API Key (For Paid/Pro Model)',
      placeholder: 'AIza...',
      link: 'Get API Key from Google AI Studio',
      save: 'Save & Start',
      current: 'Current Key',
      change: 'Change',
      warning: 'API Key is stored locally in your browser and never sent to our server.',
      free_title: '🆓 Want to use for FREE?',
      free_btn: 'Use FREE on Google AI Studio',
      free_note: '※ Login with your Google account to use',
      pro_desc: 'To use Gemini 3 Pro (LEGEND), please set a separate API key.',
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

      {/* Free AI Studio Link - Prominent */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-4 border-green-500 p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        <p className="font-bold text-green-700 text-sm">{text.free_title}</p>
        <a
          href={AI_STUDIO_FREE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 border-2 border-black text-center transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          {text.free_btn}
          <ExternalLink size={14} />
        </a>
        <p className="text-xs text-green-600">{text.free_note}</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-[2px] flex-1 bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-bold">OR</span>
        <div className="h-[2px] flex-1 bg-gray-200"></div>
      </div>

      {/* Standard Key Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
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
        </div>
      </div>
    </div>
  );
};
