import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Pixelated Window */}
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-yellow-400 border-b-4 border-black px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black uppercase tracking-tight flex items-center gap-2">
            <span className="text-xs">◆</span> {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="px-6 py-6 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};