import React, { useState } from 'react';
import { X, Twitter, MessageCircle, Link2, Image as ImageIcon, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { GeneratedItem } from '../types';

interface ShareModalProps {
  item: GeneratedItem;
  currentImageUrl: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, currentImageUrl, onClose }) => {
  const [includeRemix, setIncludeRemix] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Generate share text
  const getShareText = () => {
    let text = item.socialText || '';
    
    if (includeRemix) {
      const baseUrl = window.location.origin + window.location.pathname;
      const params = new URLSearchParams();
      
      // Shorter prompt for URL
      let safePrompt = item.originalPrompt || '';
      if (safePrompt.length > 200) {
        safePrompt = safePrompt.substring(0, 200);
      }
      
      if (safePrompt) params.set('p', safePrompt);
      if (item.themeId) params.set('t', item.themeId);
      if (item.angleId) params.set('a', item.angleId);
      if (item.aspectRatio) params.set('r', item.aspectRatio);
      params.set('m', 'flash');
      
      const remixUrl = `${baseUrl}?${params.toString()}`;
      text += `\n\n🍌 REMIX → ${remixUrl}`;
    }
    
    return text;
  };

  // Convert base64 to blob for sharing
  const getImageBlob = async (): Promise<File | null> => {
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      return new File([blob], 'nanobanana-image.png', { type: 'image/png' });
    } catch (e) {
      console.error('Failed to create image file:', e);
      return null;
    }
  };

  // Native share with image (mobile)
  const handleNativeShare = async () => {
    const shareText = getShareText();
    const imageFile = await getImageBlob();
    
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          text: shareText,
        };
        
        // Check if file sharing is supported
        if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          shareData.files = [imageFile];
        }
        
        await navigator.share(shareData);
        onClose();
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Share failed:', e);
        }
      }
    }
  };

  // Share to X (Twitter)
  const handleShareToX = () => {
    const shareText = getShareText();
    const textParam = encodeURIComponent(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${textParam}`;
    window.open(twitterUrl, '_blank');
  };

  // Share to LINE
  const handleShareToLine = () => {
    const shareText = getShareText();
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank');
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    const shareText = getShareText();
    await navigator.clipboard.writeText(shareText);
    setCopied('text');
    setTimeout(() => setCopied(null), 2000);
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied('image');
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error('Failed to copy image:', e);
    }
  };

  // Download image
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `nanobanana-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b-4 border-black bg-yellow-400">
          <h3 className="font-bold text-black text-lg">📤 SHARE</h3>
          <button 
            onClick={onClose}
            className="bg-black text-white p-1 hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 border-b-2 border-gray-200 bg-white">
          <div className="flex gap-3">
            <img 
              src={currentImageUrl} 
              alt="Share preview" 
              className="w-20 h-20 object-cover border-2 border-black"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 line-clamp-3 font-mono">
                {item.socialText}
              </p>
            </div>
          </div>
        </div>

        {/* Remix Toggle */}
        <div className="p-4 border-b-2 border-gray-200 bg-white">
          <button
            onClick={() => setIncludeRemix(!includeRemix)}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">🔗 REMIXリンクを含める</span>
              <span className="text-[10px] text-gray-500">(設定を共有)</span>
            </div>
            {includeRemix ? (
              <ToggleRight size={28} className="text-green-500" />
            ) : (
              <ToggleLeft size={28} className="text-gray-400" />
            )}
          </button>
          {includeRemix && (
            <p className="text-[10px] text-gray-600 mt-2 bg-gray-100 p-2 rounded">
              ※ プロンプト・テーマ・アングル情報がURLに含まれます
            </p>
          )}
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-2 bg-white">
          {/* Native Share (Mobile) */}
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ImageIcon size={20} />
              <span>画像付きで共有</span>
              <span className="ml-auto text-xs opacity-80">おすすめ</span>
            </button>
          )}

          {/* X (Twitter) */}
          <button
            onClick={handleShareToX}
            className="w-full flex items-center gap-3 p-3 bg-black text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Twitter size={20} />
            <span>X (Twitter)</span>
          </button>

          {/* LINE */}
          <button
            onClick={handleShareToLine}
            className="w-full flex items-center gap-3 p-3 bg-[#00B900] text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <MessageCircle size={20} />
            <span>LINE</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-medium">または</span>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
          </div>

          {/* Copy buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border-2 border-black font-bold text-sm text-black hover:bg-yellow-100 transition-colors"
            >
              {copied === 'text' ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
              {copied === 'text' ? 'COPIED!' : 'テキスト'}
            </button>
            <button
              onClick={handleCopyImage}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border-2 border-black font-bold text-sm text-black hover:bg-yellow-100 transition-colors"
            >
              {copied === 'image' ? <Check size={16} className="text-green-500" /> : <ImageIcon size={16} />}
              {copied === 'image' ? 'COPIED!' : '画像'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border-2 border-black font-bold text-sm text-black hover:bg-yellow-100 transition-colors"
            >
              💾 保存
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="p-3 bg-yellow-50 border-t-2 border-yellow-200">
          <p className="text-xs text-yellow-800 text-center font-medium">
            💡 画像はコピーまたは保存してから投稿に添付してね！
          </p>
        </div>
      </div>
    </div>
  );
};

