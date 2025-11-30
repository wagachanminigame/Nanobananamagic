
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Info, Zap, StopCircle, PlayCircle, Image as ImageIcon, Sparkles, Crown, Key, AlertTriangle, History, Camera, Check, ShoppingBag, Sword, Globe, ExternalLink } from 'lucide-react';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { ImageCard } from './components/ImageCard';
import { ImageUploader } from './components/ImageUploader';
import { BananaIcon } from './components/BananaIcon';
import { MiniGame } from './components/MiniGame';
import { TimerGame } from './components/TimerGame';
import { THEMES, RATIO_LABELS, ANGLES, MAX_GALLERY_SIZE, AUTO_GEN_LIMIT, TRANSLATIONS, PIXIV_RATIO_MAP } from './constants';
import { AspectRatio, GeneratedItem, ModelType, ImageVariation } from './types';
import { generateImage, generateSocialText, refinePrompt } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedAngle, setSelectedAngle] = useState(ANGLES[0].id);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [selectedModel, setSelectedModel] = useState<ModelType>('flash');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedItem[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0); // Notification count
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAngleModalOpen, setIsAngleModalOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false); // MiniGame Modal
  const [gameImage, setGameImage] = useState<string>(''); // Image for MiniGame
  const [error, setError] = useState<string | null>(null);
  const [loopCount, setLoopCount] = useState(0);
  const [bananaAnimation, setBananaAnimation] = useState('');
  const [bananaAnimationKey, setBananaAnimationKey] = useState(0); // Key to force re-render
  const [bananaClickCount, setBananaClickCount] = useState(0); // Counter for hidden game
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');
  const [autoRatioMessage, setAutoRatioMessage] = useState<string | null>(null);

  // Refs for loop control and state tracking
  const isLoopingRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const loopCountRef = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Translation Helper
  const t = TRANSLATIONS[language];

  // --- URL Parameter Handling for Remix Links ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p'); // Prompt
    const t = params.get('t'); // Theme ID
    const a = params.get('a'); // Angle ID
    const r = params.get('r'); // Ratio
    const m = params.get('m'); // Model

    let loaded = false;

    if (p) {
      setPrompt(decodeURIComponent(p));
      loaded = true;
    }
    if (t && THEMES.some(theme => theme.id === t)) {
      setSelectedTheme(t);
      loaded = true;
    }
    if (a && ANGLES.some(angle => angle.id === a)) {
      setSelectedAngle(a);
      loaded = true;
    }
    if (r && Object.values(AspectRatio).includes(r as AspectRatio)) {
      setAspectRatio(r as AspectRatio);
      loaded = true;
    }
    if (m === 'flash' || m === 'pro') {
      setSelectedModel(m as ModelType);
      loaded = true;
    }

    if (loaded) {
      setAutoRatioMessage("⚡ REMIX DATA LOADED! ⚡");
      // Clean URL without reloading page
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setAutoRatioMessage(null), 4000);
    }
  }, []);

  // Toggle Help / Modals
  const toggleHelp = () => setIsHelpOpen(!isHelpOpen);
  
  const toggleHistory = () => {
    if (!isHistoryOpen) {
      setNewItemsCount(0); // Clear notification on open
    }
    setIsHistoryOpen(!isHistoryOpen);
  };

  const toggleAngleModal = () => setIsAngleModalOpen(!isAngleModalOpen);
  const toggleGame = () => {
     setIsGameOpen(!isGameOpen);
     if (isGameOpen) {
       setBananaClickCount(0); // Reset count on close
     }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'en' : 'ja');
  };

  // Trigger Random Banana Animation & Check Hidden Game
  const handleBananaClick = () => {
    // 1. Trigger Animation
    setBananaAnimationKey(prev => prev + 1);
    
    const animations = [
        'animate-banana-drop',
        'animate-banana-jump', 
        'animate-banana-shake',
        'animate-banana-spin',
        'animate-banana-pop'
    ];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setBananaAnimation(randomAnim);

    // 2. Hidden Game Logic (Only if images exist)
    if (gallery.length > 0) {
        setBananaClickCount(prev => {
            const newCount = prev + 1;
            console.log("Banana Clicks:", newCount);
            if (newCount >= 3) {
                // Trigger Game!
                const randomItem = gallery[Math.floor(Math.random() * gallery.length)];
                setGameImage(randomItem.imageUrl);
                setIsGameOpen(true);
                return 0; // Reset
            }
            return newCount;
        });
    }
  };

  // Handle Theme Change with Auto Ratio Logic
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newThemeId = e.target.value;
    setSelectedTheme(newThemeId);

    // Check if there is a recommended ratio for this theme (Pixiv goods)
    if (PIXIV_RATIO_MAP[newThemeId]) {
      setAspectRatio(PIXIV_RATIO_MAP[newThemeId]);
      
      const themeName = THEMES.find(t => t.id === newThemeId)?.label;
      const ratioName = RATIO_LABELS[PIXIV_RATIO_MAP[newThemeId]];
      
      setAutoRatioMessage(`グッズ用に比率を自動設定: ${ratioName}`);
      setTimeout(() => setAutoRatioMessage(null), 3000);
    }
  };

  // Open API Key Dialog
  const openApiKeyDialog = async () => {
    try {
      if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      } else {
        console.warn("AI Studio client not found");
      }
    } catch (e) {
      console.error("Failed to open API key dialog", e);
    }
  };

  // Handle Model Change
  const handleModelChange = async (model: ModelType) => {
    setSelectedModel(model);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  // Handle Remix (Relay) from within the App
  const handleRemix = (item: GeneratedItem) => {
    // 1. Restore Prompt
    setPrompt(item.originalPrompt);
    
    // 2. Restore Aspect Ratio
    setAspectRatio(item.aspectRatio);

    // 3. Restore Theme (Use ID if available)
    if (item.themeId && THEMES.some(t => t.id === item.themeId)) {
      setSelectedTheme(item.themeId);
    } else {
      // Fallback: Default to first theme or try to match logic if needed
      // (For items created before this update, themeId might be missing)
      setSelectedTheme(THEMES[0].id);
    }

    // 4. Restore Angle (Use ID if available, otherwise fallback to label match)
    if (item.angleId && ANGLES.some(a => a.id === item.angleId)) {
        setSelectedAngle(item.angleId);
    } else {
        const angleObj = ANGLES.find(a => a.label === item.angle);
        if (angleObj) setSelectedAngle(angleObj.id);
        else setSelectedAngle(ANGLES[0].id);
    }

    // 5. Restore Reference Image if it exists
    if (item.referenceImage) {
        setReferenceImage(item.referenceImage);
    }

    setIsHistoryOpen(false); // Close history if open
    
    // Scroll to top
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    setAutoRatioMessage("REMIX: 呪文・世界観・アングルを完全継承！");
    setTimeout(() => setAutoRatioMessage(null), 3000);
  };

  // Generation Logic
  const performGeneration = useCallback(async () => {
    if (isGeneratingRef.current) return;

    setIsGenerating(true);
    isGeneratingRef.current = true;
    setError(null);

    try {
      const themeConfig = THEMES.find(t => t.id === selectedTheme);
      const themeValue = themeConfig ? themeConfig.value : '';

      const angleConfig = ANGLES.find(a => a.id === selectedAngle);
      const angleValue = angleConfig ? angleConfig.value : '';

      // Check if we need to generate multiple variations (e.g. Dakimakura Front/Back)
      // If it's dakimakura, we set iterations to ['Front Side', 'Back Side']
      // Otherwise, just a single iteration [null]
      const variationLabels = selectedTheme === 'pixiv_dakimakura' 
          ? ['Front Side', 'Back Side'] 
          : [null];

      const generatedImages: ImageVariation[] = [];
      let finalRefinedPrompt = '';
      let socialText = '';

      // Loop through variations (Sequential generation)
      for (const variation of variationLabels) {
        
        // Determine reference image for this step
        let stepRefImage = referenceImage;
        
        // Special Case: Dakimakura Back Side uses the generated Front Side as reference
        // This ensures character consistency (I2I: Front -> Back)
        if (selectedTheme === 'pixiv_dakimakura' && variation === 'Back Side' && generatedImages.length > 0) {
            stepRefImage = generatedImages[0].url;
        }

        // 1. Refine Prompt
        const currentRefinedPrompt = await refinePrompt(
          themeValue, 
          prompt, 
          !!stepRefImage, // Important: pass true if we have a generated ref image
          angleValue,
          variation || ''
        );
        
        // Save the first refined prompt for social text / display
        if (!finalRefinedPrompt) finalRefinedPrompt = currentRefinedPrompt;
        
        // 2. Generate Image
        const base64Image = await generateImage(
          currentRefinedPrompt, 
          aspectRatio, 
          selectedModel,
          stepRefImage // Pass the step specific ref image
        );
        
        if (base64Image) {
          generatedImages.push({
            url: base64Image,
            label: variation || 'Main'
          });
        }
        
        // Short delay between variations to avoid hitting rate limits too hard if Pro
        if (variationLabels.length > 1) {
             await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (generatedImages.length === 0) {
        throw new Error("生成に失敗した... 装備を見直そう。(画像データなし)");
      }

      // 3. Generate Social Text (Only once based on the prompt)
      socialText = await generateSocialText(finalRefinedPrompt);

      // 4. Update Gallery with consolidated Item
      const newItem: GeneratedItem = {
        id: crypto.randomUUID(),
        imageUrl: generatedImages[0].url, // Primary image
        variations: generatedImages, // All variations
        originalPrompt: prompt,
        refinedPrompt: finalRefinedPrompt,
        socialText: socialText,
        timestamp: Date.now(),
        aspectRatio: aspectRatio,
        model: selectedModel,
        referenceImage: referenceImage || undefined,
        angle: angleConfig?.label,
        angleId: selectedAngle, // Store current ID for restoration
        themeId: selectedTheme  // Store current ID for restoration
      };

      setGallery(prev => {
        const newGallery = [newItem, ...prev];
        return newGallery.slice(0, MAX_GALLERY_SIZE);
      });
      
      // Increment notification count
      setNewItemsCount(prev => prev + 1);

      // Increment loop count (only once per batch)
      if (isLoopingRef.current) {
        loopCountRef.current += 1;
        setLoopCount(loopCountRef.current);
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      
      let msg = err.message || "生成失敗！エラーが発生しました。";
      
      const isPermissionError = 
        err.status === 403 || 
        err.code === 403 ||
        (err.message && (
          err.message.includes("permission") || 
          err.message.includes("PERMISSION_DENIED") ||
          err.message.includes("Requested entity was not found") || 
          err.message.includes("API key not valid")
        ));

      if (isPermissionError) {
         msg = "APIキーの権限がありません。Pro装備を使うには課金キーが必要です。";
      } else if (err.message && err.message.includes("400")) {
        msg = "リクエスト無効。プロンプト呪文を確認してください。";
      }

      setError(msg);
      
      // Stop loop on error
      setIsLooping(false);
      isLoopingRef.current = false;
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [prompt, selectedTheme, selectedAngle, aspectRatio, selectedModel, referenceImage]);

  // Stable reference for loop
  const savedPerformGeneration = useRef(performGeneration);
  useEffect(() => {
    savedPerformGeneration.current = performGeneration;
  }, [performGeneration]);

  // Loop Effect
  useEffect(() => {
    let timeoutId: number;
    let isCancelled = false;

    const loop = async () => {
      if (!isLoopingRef.current || isCancelled) return;
      
      if (loopCountRef.current >= AUTO_GEN_LIMIT) {
        setIsLooping(false);
        isLoopingRef.current = false;
        setError(t.limit_warning(AUTO_GEN_LIMIT));
        return;
      }

      // Execute generation
      await savedPerformGeneration.current();

      // Schedule next run
      if (isLoopingRef.current && !isCancelled) {
        timeoutId = window.setTimeout(loop, 3000); // 3s delay
      }
    };

    if (isLooping) {
      loop();
    }

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isLooping, t]);

  const handleGenerate = () => {
    if (isLooping) {
        setIsLooping(false);
        isLoopingRef.current = false;
    }
    performGeneration();
  };

  const toggleLoop = () => {
    if (isLooping) {
      setIsLooping(false);
      isLoopingRef.current = false;
    } else {
      setLoopCount(0);
      loopCountRef.current = 0;
      setIsLooping(true);
      isLoopingRef.current = true;
    }
  };

  // Stop loop manually from overlay
  const stopLoopFromOverlay = () => {
     setIsLooping(false);
     isLoopingRef.current = false;
  };

  // Get current angle label
  const currentAngleLabel = ANGLES.find(a => a.id === selectedAngle)?.label || '指定なし';

  // Group items for Collection Room
  const squareItems = gallery.filter(i => [AspectRatio.Square, AspectRatio.Grid3x3].includes(i.aspectRatio));
  const portraitItems = gallery.filter(i => [AspectRatio.Portrait, AspectRatio.Tall, AspectRatio.Kindle].includes(i.aspectRatio));
  const landscapeItems = gallery.filter(i => [AspectRatio.Landscape, AspectRatio.Wide, AspectRatio.XHeader].includes(i.aspectRatio));

  return (
    <div className="min-h-screen pb-12" ref={topRef}>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b-4 border-yellow-600 shadow-md w-full">
        <div className="max-w-lg mx-auto px-2 sm:px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
            onClick={handleBananaClick}
          >
            <div key={bananaAnimationKey} className={`relative ${bananaAnimation}`}>
              <BananaIcon size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-widest leading-none" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>NANOBANANA</h1>
              <p className="text-[9px] sm:text-[10px] text-yellow-400 font-mono tracking-widest">MAGIC FACTORY</p>
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <button 
              onClick={toggleLanguage}
              className="bg-white p-1.5 sm:p-2 border-2 border-yellow-500 hover:bg-yellow-100 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] w-8 h-8 sm:w-10 sm:h-9 flex items-center justify-center font-bold text-[10px] sm:text-xs"
              title="LANGUAGE"
            >
               {language === 'ja' ? 'EN' : 'JP'}
            </button>
            <button 
              onClick={toggleHistory}
              className="bg-white p-1.5 sm:p-2 border-2 border-yellow-500 hover:bg-yellow-100 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] w-8 h-8 sm:w-auto sm:h-auto relative group"
              title={t.history_btn}
            >
              <History size={16} className={`text-black ${newItemsCount > 0 ? 'animate-pulse' : ''}`} />
              {newItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce min-w-[20px] z-10">
                  {newItemsCount > 99 ? '99+' : newItemsCount}
                </span>
              )}
            </button>
            <button 
              onClick={openApiKeyDialog}
              className="bg-white p-1.5 sm:p-2 border-2 border-yellow-500 hover:bg-yellow-100 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] w-8 h-8 sm:w-auto sm:h-auto"
              title={t.key_btn}
            >
              <Key size={16} className="text-black" />
            </button>
            <button 
              onClick={toggleHelp}
              className="bg-white p-1.5 sm:p-2 border-2 border-yellow-500 hover:bg-yellow-100 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] w-8 h-8 sm:w-auto sm:h-auto"
              title={t.help_btn}
            >
              <Info size={16} className="text-black" />
            </button>
          </div>
        </div>
      </header>

      {/* LINE Promo Banner */}
      <div className="bg-[#06C755] border-b-4 border-black text-center py-2 px-4 shadow-sm relative overflow-hidden group animate-flash-occasionally">
         <a 
            href="https://lin.ee/fz5ZIFu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:underline decoration-white underline-offset-2"
         >
           <span className="animate-pulse">✨</span>
           最新の装備(ツール)配布はこちら！
           <span className="bg-white text-[#06C755] px-1 rounded text-[10px] font-black">LINE</span>
           <span className="animate-pulse">✨</span>
         </a>
      </div>

      {/* pixivFACTORY Promo Banner */}
      <div className="bg-[#0096fa] border-b-4 border-black text-center py-1.5 px-4 shadow-sm">
         <a 
            href="https://factory.pixiv.net/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90"
         >
           <span>🏭</span>
           Make Goods with pixivFACTORY
           <ExternalLink size={12} />
         </a>
      </div>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Warning Section */}
        <div className="bg-yellow-100 border-4 border-yellow-600 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex gap-3 items-start">
           <AlertTriangle className="text-yellow-700 shrink-0 mt-0.5" size={24} />
           <div className="text-xs text-yellow-900 font-bold space-y-1">
             <p className="text-sm underline decoration-yellow-700 decoration-2 underline-offset-2 mb-1">{t.shop_warning}</p>
             <p>{t.gold_warning}</p>
             <p className="text-red-600">{t.free_warning}</p>
             <p>{t.limit_warning(AUTO_GEN_LIMIT)}</p>
           </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white border-4 border-black p-4 space-y-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] relative">
          
          {/* Auto Ratio Notification */}
          {autoRatioMessage && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-bounce whitespace-nowrap">
              {autoRatioMessage}
            </div>
          )}
          
          {/* Dakimakura Warning */}
          {selectedTheme === 'pixiv_dakimakura' && (
             <div className="bg-red-50 border-2 border-red-500 p-2 text-[10px] text-red-600 font-bold mb-2 whitespace-pre-wrap">
               {t.dakimakura_warning}
             </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <Sparkles size={16} />
              {t.prompt_label}
            </label>
            <textarea
              className="w-full h-24 p-3 bg-gray-50 border-4 border-gray-300 focus:border-black focus:ring-0 text-base resize-none transition-colors"
              placeholder={t.prompt_ph}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating || isLooping}
            />
          </div>

          {/* Theme Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <ShoppingBag size={16} />
              {t.theme_label}
            </label>
            <div className="relative">
              <select
                className="w-full p-3 bg-white border-4 border-black appearance-none font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                value={selectedTheme}
                onChange={handleThemeChange}
                disabled={isGenerating || isLooping}
              >
                {THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-2 border-black pl-2">
                ▼
              </div>
            </div>
          </div>

          {/* Model Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <Sword size={16} />
              {t.tier_label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModelChange('flash')}
                className={`p-2 text-xs font-bold border-4 transition-all ${
                  selectedModel === 'flash'
                    ? 'bg-yellow-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                }`}
              >
                STD (FLASH)<br/><span className="text-[10px]">FREE</span>
              </button>
              <button
                onClick={() => handleModelChange('pro')}
                className={`p-2 text-xs font-bold border-4 transition-all relative overflow-hidden ${
                  selectedModel === 'pro'
                    ? 'bg-black text-yellow-400 border-yellow-500 shadow-[2px_2px_0px_0px_rgba(250,204,21,0.5)] translate-x-[1px] translate-y-[1px]'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                }`}
              >
                 <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        LEGEND (PRO) <Crown size={10} />
                    </div>
                    <span className="text-[10px] text-red-500 bg-white px-1 mt-0.5">GOLD REQ.</span>
                 </div>
              </button>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <ImageIcon size={16} />
              {t.ratio_label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(AspectRatio) as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  disabled={isGenerating || isLooping}
                  className={`
                    py-2 px-1 text-xs font-bold border-4 transition-all
                    ${aspectRatio === ratio 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border-gray-200 hover:border-gray-400'
                    }
                  `}
                >
                  {RATIO_LABELS[ratio]}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Angle Button */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <Camera size={16} />
              {t.angle_label}
            </label>
            <button
               onClick={toggleAngleModal}
               disabled={isGenerating || isLooping}
               className="w-full p-3 bg-white border-4 border-black font-bold text-left flex justify-between items-center hover:bg-gray-50 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span>{currentAngleLabel}</span>
              <span className="bg-black text-white text-xs px-2 py-1">{t.change_angle}</span>
            </button>
          </div>

          {/* Image Uploader */}
          <ImageUploader 
            onImageSelect={setReferenceImage} 
            selectedImage={referenceImage}
            lang={language}
          />

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
             <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || isLooping}
              className="w-full py-4 text-base"
              isLoading={isGenerating && !isLooping}
             >
               <Zap className="mr-2 fill-current" />
               {t.create_btn}
             </Button>

             <Button 
              variant={isLooping ? "danger" : "secondary"}
              onClick={toggleLoop}
              disabled={(isGenerating && !isLooping)}
              className="w-full py-3 text-sm"
             >
               {isLooping ? (
                 <>
                   <StopCircle className="mr-2" />
                   {t.stop_auto} ({loopCount}/{AUTO_GEN_LIMIT})
                 </>
               ) : (
                 <>
                   <PlayCircle className="mr-2" />
                   {t.start_auto}
                 </>
               )}
             </Button>
          </div>
        </div>

        {/* Loading / Timer Game Overlay - Shows when Generating OR Looping (including cooldowns) */}
        {(isGenerating || isLooping) && (
           <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="mb-2 text-white text-2xl font-bold animate-pulse text-center" style={{ textShadow: '2px 2px 0 #000' }}>
               {isGenerating ? t.loading : "NEXT SPELL IN 3s..."}
             </div>
             
             {/* Waiting Message */}
             <div className="mb-6 text-yellow-300 text-sm font-bold text-center bg-black/50 px-4 py-2 rounded-lg border-2 border-yellow-500 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                {language === 'ja' ? '魔法を詠唱中... 暇つぶしにどうぞ！' : 'Casting spells... Enjoy this game while waiting!'}
             </div>

             <TimerGame lang={language} />
             
             {isLooping && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="text-white text-xs font-mono">
                    AUTO CRAFTING: {loopCount + 1}/{AUTO_GEN_LIMIT}
                  </div>
                  <button 
                    onClick={stopLoopFromOverlay}
                    className="bg-red-500 text-white font-bold px-6 py-2 border-2 border-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] flex items-center gap-2"
                  >
                     <StopCircle size={16} /> STOP AUTO CRAFT
                  </button>
                </div>
             )}
           </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-4 border-red-500 text-red-700 p-4 font-bold flex items-center gap-3 animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            <AlertTriangle size={24} />
            <div className="whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {/* Latest Result */}
        {gallery.length > 0 && !isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-black text-white px-2 py-1 text-sm font-bold">{t.latest_drop}</span>
                <span className="h-1 flex-1 bg-black"></span>
            </div>
            <ImageCard 
                item={gallery[0]} 
                isFeatured={true}
                onDelete={handleDeleteItem}
                onRemix={handleRemix}
            />
          </div>
        )}

      </main>

      {/* History Modal / Collection Room */}
      <Modal isOpen={isHistoryOpen} onClose={toggleHistory} title={t.history_title}>
         {gallery.length === 0 ? (
           <div className="text-center py-10 text-gray-500 font-bold min-h-[300px] flex flex-col items-center justify-center">
             <div className="text-4xl mb-2">📦</div>
             <p>NO ITEMS FOUND</p>
             <p className="text-xs mt-1">Generate something first!</p>
           </div>
         ) : (
           <div className="bg-[#2a2a2a] p-4 border-4 border-black text-white min-h-[50vh]">
             <div className="mb-4 text-center text-xs font-mono text-gray-400">
                TOTAL COLLECTED: {gallery.length}
             </div>
             
             {/* Square Room */}
             {squareItems.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-yellow-400 font-bold text-lg mb-2 border-b-2 border-yellow-600 inline-block px-2 bg-black/50">
                    {t.collection_square}
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {squareItems.map(item => (
                     <ImageCard key={item.id} item={item} onDelete={handleDeleteItem} onRemix={handleRemix} />
                   ))}
                 </div>
               </div>
             )}

             {/* Portrait Room */}
             {portraitItems.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-yellow-400 font-bold text-lg mb-2 border-b-2 border-yellow-600 inline-block px-2 bg-black/50">
                    {t.collection_portrait}
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {portraitItems.map(item => (
                     <ImageCard key={item.id} item={item} onDelete={handleDeleteItem} onRemix={handleRemix} />
                   ))}
                 </div>
               </div>
             )}

             {/* Landscape Room */}
             {landscapeItems.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-yellow-400 font-bold text-lg mb-2 border-b-2 border-yellow-600 inline-block px-2 bg-black/50">
                    {t.collection_landscape}
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {landscapeItems.map(item => (
                     <ImageCard key={item.id} item={item} onDelete={handleDeleteItem} onRemix={handleRemix} />
                   ))}
                 </div>
               </div>
             )}
           </div>
         )}
      </Modal>

      {/* Angle Selection Modal */}
      <Modal isOpen={isAngleModalOpen} onClose={toggleAngleModal} title={t.angle_label}>
          <div className="space-y-1">
             {ANGLES.map((angle) => (
                <button
                  key={angle.id}
                  onClick={() => {
                      setSelectedAngle(angle.id);
                      toggleAngleModal();
                  }}
                  className={`w-full text-left p-3 border-b-2 border-dashed border-gray-300 hover:bg-yellow-50 transition-colors flex items-center justify-between group ${selectedAngle === angle.id ? 'bg-yellow-100' : ''}`}
                >
                   <div>
                      <div className="font-bold text-sm group-hover:text-yellow-700">{angle.label}</div>
                      <div className="text-xs text-gray-500">{angle.description}</div>
                   </div>
                   {selectedAngle === angle.id && <Check size={16} className="text-black" />}
                </button>
             ))}
          </div>
      </Modal>

      {/* Mini Game Modal */}
      <Modal isOpen={isGameOpen} onClose={toggleGame} title="HIDDEN STAGE">
         <div className="flex justify-center bg-black/90 p-2">
            <MiniGame enemyImageUrl={gameImage} onClose={toggleGame} />
         </div>
      </Modal>

      {/* Help Modal (Always Japanese as it is verbose story text, or could be translated later) */}
      <Modal isOpen={isHelpOpen} onClose={toggleHelp} title={t.help_title}>
        <div className="space-y-6 text-sm font-medium leading-relaxed">
          <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
            <p className="mb-2">
              <strong>Nanobanana Magicへようこそ！</strong><br/>
              ここはGeminiの魔力を宿した不思議なアイテム生成工房です。
            </p>
          </div>

          <div>
            <h4 className="border-b-2 border-black inline-block mb-3 font-bold bg-yellow-200 px-1">クラフトの手引き</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>呪文と世界観:</strong> 作りたいもののキーワードを入力し、好みのテーマを選んでください。</li>
              <li><strong>素材装備:</strong> 画像をアップロードすると、そのキャラクターや構図を反映させることができます。</li>
              <li><strong>アングル指定:</strong> カメラの視点を変更して、迫力ある構図を狙えます。</li>
              <li><strong>REMIX (リレー):</strong> 他の画像の「REMIX」ボタンを押すと、その呪文を引き継いで続きを作れます。</li>
              <li><strong>CREATE ITEM:</strong> 1つだけ生成します。</li>
              <li><strong>AUTO CRAFT:</strong> 停止ボタンを押すか、最大20回に達するまで自動で生成し続けます。</li>
            </ul>
          </div>

          <div>
            <h4 className="border-b-2 border-black inline-block mb-3 font-bold bg-yellow-200 px-1">装備ランク (モデル解説)</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <strong>STD (Flash) - 無料:</strong><br/>
                錬成速度が速い標準モデル。一般的なアイテム生成に最適です。無料で使えます。
              </li>
              <li>
                <strong>LEGEND (Pro) - ゴールド必須:</strong><br/>
                高画質で緻密な描写が可能な上位モデル。生成に時間がかかり、課金APIキーが必要です。
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-400 border-t border-gray-200 pt-4">
             <p>Security Note: API Key is stored only in your browser session. この工房は安全です。</p>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;
