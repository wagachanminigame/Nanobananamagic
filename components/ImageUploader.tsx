import React, { useRef, useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import { TRANSLATIONS } from "../constants";

const MAX_IMAGES = 5; // Maximum number of reference images

interface ImageUploaderProps {
  onImageSelect: (images: string[]) => void;
  selectedImages: string[];
  lang: "ja" | "en";
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  selectedImages,
  lang,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFiles = async (files: File[]) => {
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    // Read all files and collect results
    const readPromises = filesToProcess.map((file) => {
      return new Promise<string | null>((resolve) => {
        if (!file.type.startsWith("image/")) {
          alert("装備できないファイル形式です！画像を装備してください。");
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(readPromises);
    const validImages = results.filter((img): img is string => img !== null);

    if (validImages.length > 0) {
      onImageSelect([...selectedImages, ...validImages]);
    }
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
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImageSelect(newImages);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canAddMore = selectedImages.length < MAX_IMAGES;

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
        <span className="bg-black text-yellow-400 px-1.5 py-0.5 text-xs">
          {t.ref_optional}
        </span>
        {t.ref_image_label}
        <span className="text-gray-500 font-normal text-xs">
          ({selectedImages.length}/{MAX_IMAGES})
        </span>
      </label>

      {/* Image Grid */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mb-2">
          {selectedImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square bg-black border-2 border-gray-400 overflow-hidden group"
            >
              <img
                src={image}
                alt={`Reference ${index + 1}`}
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={(e) => handleRemoveImage(index, e)}
                className="absolute top-1 right-1 bg-red-500 border border-black text-white p-0.5 hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                title="UNEQUIP"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                #{index + 1}
              </div>
            </div>
          ))}

          {/* Add More Button (within grid) */}
          {canAddMore && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-400 bg-white hover:bg-gray-50 hover:border-black cursor-pointer flex flex-col items-center justify-center transition-all"
            >
              <Plus size={20} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 mt-1">追加</span>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone (shown when no images or as alternative) */}
      {selectedImages.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative group cursor-pointer 
            border-4 border-dashed transition-all duration-200
            flex flex-col items-center justify-center p-6 h-32
            ${
              isDragging
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-400 bg-white hover:bg-gray-50 hover:border-black"
            }
          `}
          style={{ imageRendering: "pixelated" }}
        >
          <div className="bg-gray-100 border-2 border-gray-300 p-2 mb-2 group-hover:scale-110 transition-transform">
            <Upload className="text-gray-500" size={20} />
          </div>
          <p className="text-xs text-gray-500 font-bold">{t.drag_drop}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            最大{MAX_IMAGES}枚まで
          </p>
        </div>
      )}

      {/* Hidden File Input - supports multiple */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Clear All Button */}
      {selectedImages.length > 1 && (
        <button
          onClick={handleClearAll}
          className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
        >
          すべて削除
        </button>
      )}
    </div>
  );
};
