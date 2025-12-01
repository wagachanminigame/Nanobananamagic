
import React, { useState } from 'react';
import { Share2, Download, Copy, Trash2, ShoppingBag, ChevronLeft, ChevronRight, FileText, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { GeneratedItem, AspectRatio } from '../types';
import { ShareModal } from './ShareModal';

interface ImageCardProps {
  item: GeneratedItem;
  isFeatured?: boolean;
  onDelete?: (id: string) => void;
  onRemix?: (item: GeneratedItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ item, isFeatured = false, onDelete, onRemix }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Use variations if available, otherwise fallback to single image
  const images = item.variations && item.variations.length > 0 
    ? item.variations 
    : [{ url: item.imageUrl, label: 'Main' }];

  const currentImage = images[currentIndex];

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
      setFeedback({ msg, type });
      setTimeout(() => setFeedback(null), 2000);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `nanobanana-${item.id}-${currentIndex}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImage = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    try {
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        showFeedback('COPIED IMAGE!');
    } catch (e) {
        console.error(e);
        showFeedback('COPY FAILED', 'error');
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(item.originalPrompt || item.refinedPrompt);
    showFeedback('COPIED PROMPT!');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) onDelete(item.id);
      setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDeleteConfirm(false);
  };

  const handlePixiv = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      window.open('https://factory.pixiv.net/', '_blank');
  };

  const handleRemixClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemix) {
          onRemix(item);
          showFeedback('REMIX READY! (Scroll Up)');
      }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getAspectClass = (ratio: AspectRatio) => {
    switch(ratio) {
      case AspectRatio.Square: return "aspect-square";
      case AspectRatio.Portrait: return "aspect-[3/4]";
      case AspectRatio.Landscape: return "aspect-[4/3]";
      case AspectRatio.Wide: return "aspect-video";
      case AspectRatio.Tall: return "aspect-[9/16]";
      case AspectRatio.Grid3x3: return "aspect-square"; 
      case AspectRatio.XHeader: return "aspect-video"; 
      default: return "aspect-square";
    }
  };

  const aspectClass = getAspectClass(item.aspectRatio);

  return (
    <div className={`relative bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isFeatured ? 'col-span-full' : ''}`}>
      
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-gray-200 border-b-4 border-black ${isFeatured ? 'w-full' : ''} ${aspectClass} group`}>
        <img 
          src={currentImage.url} 
          alt={item.originalPrompt} 
          className="h-full w-full object-cover rendering-pixelated"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && !showDeleteConfirm && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-1 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-1 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 text-xs font-bold border border-white rounded-full backdrop-blur-sm z-10 pointer-events-none shadow-sm">
               {currentImage.label} ({currentIndex + 1}/{images.length})
            </div>
          </>
        )}

        {/* FEEDBACK OVERLAY (Success/Error) */}
        {feedback && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200 pointer-events-none">
                <div className={`px-4 py-2 border-4 ${feedback.type === 'success' ? 'bg-green-500 border-white text-white' : 'bg-red-500 border-white text-white'} font-bold shadow-lg flex items-center gap-2`}>
                   {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                   {feedback.msg}
                </div>
             </div>
        )}

        {/* DELETE CONFIRMATION OVERLAY */}
        {showDeleteConfirm && (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                <p className="text-white font-bold text-sm mb-4 tracking-widest text-center">
                    DELETE ITEM?<br/>
                    <span className="text-[10px] text-gray-400 font-normal">取り消せません</span>
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={handleConfirmDelete}
                        className="bg-red-500 text-white border-2 border-white px-3 py-1.5 text-xs font-bold hover:bg-red-600 hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] flex items-center gap-1"
                    >
                        <Trash2 size={12} /> DELETE
                    </button>
                    <button 
                        onClick={handleCancelDelete}
                        className="bg-white text-black border-2 border-gray-400 px-3 py-1.5 text-xs font-bold hover:bg-gray-200 hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        )}

        {/* Action Buttons - Adjusted z-index and pointer-events */}
        <div className={`absolute inset-0 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 pointer-events-none ${showDeleteConfirm ? 'hidden' : ''}`}>
          <div className="flex gap-1 justify-end flex-wrap items-end w-full pointer-events-auto">
             {onRemix && (
                <button
                    onClick={handleRemixClick}
                    className="bg-[#d946ef] border-2 border-black p-1.5 text-white hover:bg-[#c026d3] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold flex items-center gap-1 text-[10px] sm:text-xs mb-1 shrink-0 animate-pulse hover:animate-none"
                    title="REMIX / RELAY (装備継承)"
                >
                    <RefreshCw size={14} /> REMIX
                </button>
             )}
             <button 
              onClick={handlePixiv}
              className="bg-[#0096fa] border-2 border-black p-1.5 text-white hover:bg-[#007acc] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold flex items-center gap-1 text-[10px] sm:text-xs mb-1 shrink-0"
              title="MAKE GOODS (pixivFACTORY)"
            >
              <ShoppingBag size={14} /> GOODS
            </button>
             <button 
              onClick={handleDownload}
              className="bg-white border-2 border-black p-1.5 text-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1 shrink-0"
              title="SAVE"
            >
              <Download size={16} />
            </button>
             <button 
              onClick={handleCopyImage}
              className="bg-white border-2 border-black p-1.5 text-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1 shrink-0"
              title="画像をコピー"
            >
              <Copy size={16} />
            </button>
             <button 
              onClick={handleCopyPrompt}
              className="bg-white border-2 border-black p-1.5 text-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1 shrink-0"
              title="呪文(プロンプト)をコピー"
            >
              <FileText size={16} />
            </button>
            {onDelete && (
              <button 
                onClick={handleDeleteClick}
                className="bg-red-500 border-2 border-black p-1.5 text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ml-1 mb-1 shrink-0"
                title="DELETE"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Pro Badge - Z-Index 10 */}
        {item.model === 'pro' && !showDeleteConfirm && (
           <div className="absolute top-2 left-2 bg-black text-yellow-400 text-[10px] font-bold px-2 py-1 border-2 border-yellow-400 z-10 pointer-events-none shadow-sm">
             PRO
           </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 bg-white">
        {isFeatured && (
           <div className="mb-3">
             <span className="inline-block px-2 py-1 bg-yellow-400 text-black border-2 border-black text-xs font-bold mb-2 mr-2">NEW ITEM</span>
             <p className="text-black font-medium text-sm leading-relaxed font-mono">{item.socialText}</p>
           </div>
        )}
        
        {!isFeatured && (
            <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 mb-2 font-mono">{item.socialText}</p>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-gray-100 border-dashed">
          <span className="text-[10px] text-gray-400 font-mono">
            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          <button 
            onClick={handleShareClick}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-pink-500 to-orange-400 text-white px-2 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse hover:animate-none uppercase"
          >
            <Share2 size={12} />
            SHARE
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          item={item}
          currentImageUrl={currentImage.url}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};
