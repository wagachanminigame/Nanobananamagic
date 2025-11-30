import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ImageUploaderProps {
  onImageSelect: (base64: string | null) => void;
  selectedImage: string | null;
  lang: 'ja' | 'en';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImage, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('装備できないファイル形式です！画像を装備してください。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
        <span className="bg-black text-yellow-400 px-1.5 py-0.5 text-xs">{t.ref_optional}</span>
        {t.ref_image_label}
      </label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer 
          border-4 border-dashed transition-all duration-200
          flex flex-col items-center justify-center p-6 h-32
          ${isDragging 
            ? 'border-yellow-500 bg-yellow-50' 
            : 'border-gray-400 bg-white hover:bg-gray-50 hover:border-black'
          }
          ${selectedImage ? 'border-none p-0 overflow-hidden bg-black' : ''}
        `}
        style={{ imageRendering: 'pixelated' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {selectedImage ? (
          <>
            <img 
              src={selectedImage} 
              alt="Reference" 
              className="w-full h-full object-contain opacity-80" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-black text-white border-2 border-white px-3 py-1 text-xs font-bold opacity-0 group-hover:opacity-100">
                 CHANGE ITEM
               </div>
            </div>
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 border-2 border-black text-white p-1 hover:bg-red-600 transition-colors z-10 shadow-sm"
              title="UNEQUIP"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="bg-gray-100 border-2 border-gray-300 p-2 mb-2 group-hover:scale-110 transition-transform">
              <Upload className="text-gray-500" size={20} />
            </div>
            <p className="text-xs text-gray-500 font-bold">{t.drag_drop}</p>
          </>
        )}
      </div>
    </div>
  );
};