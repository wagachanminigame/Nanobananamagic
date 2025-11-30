
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Grid3X3, RotateCcw } from 'lucide-react';
import { BananaIcon } from './BananaIcon';
import { TRANSLATIONS } from '../constants';

interface TimerGameProps {
  lang: 'ja' | 'en';
}

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_ICONS = ['🍌', '🍎', '🍇', '🍉', '🍒', '🍓', '🍍', '🥝'];

// Memoize to prevent re-renders when gallery updates in background
export const TimerGame = React.memo(({ lang }: TimerGameProps) => {
  // Timer Game State
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
  const [combo, setCombo] = useState(0);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // Memory Game State
  const [isMemoryMode, setIsMemoryMode] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [memoryCleared, setMemoryCleared] = useState(false);

  const t = TRANSLATIONS[lang];
  const TARGET_TIME = 3.00;
  const MAX_COMBO = 5;

  // --- Timer Game Logic ---
  const animate = () => {
    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    setTime(elapsed);
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleStart = () => {
    setIsRunning(true);
    setStatus('running');
    setResult(null);
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleStop = () => {
    if (!isRunning) return;
    cancelAnimationFrame(requestRef.current);
    setIsRunning(false);
    setStatus('stopped');
    
    const diff = Math.abs(TARGET_TIME - time);
    let success = false;

    if (diff < 0.015) {
      setResult(t.game_perfect);
      success = true;
    } else if (diff < 0.05) {
      setResult(t.game_great);
      success = true;
    } else if (diff < 0.10) {
      setResult(t.game_good);
      success = true;
    } else {
      setResult(t.game_try);
      success = false;
    }

    if (success) {
      setCombo(prev => Math.min(prev + 1, MAX_COMBO));
    } else {
      setCombo(0);
    }
  };

  const handleReset = () => {
    setTime(0);
    setStatus('idle');
    setResult(null);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // --- Memory Game Logic ---
  const initMemoryGame = () => {
    setIsMemoryMode(true);
    setMemoryCleared(false);
    setFlippedIds([]);
    
    // Duplicate and shuffle
    const deck = [...MEMORY_ICONS, ...MEMORY_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(deck);
  };

  const handleCardClick = (id: number) => {
    if (isProcessing || memoryCleared) return;
    
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip card
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlippedIds = [...flippedIds, id];
    setFlippedIds(newFlippedIds);

    // Check match
    if (newFlippedIds.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlippedIds;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedIds([]);
          setIsProcessing(false);
          
          // Check win condition
          if (newCards.filter(c => c.isMatched).length + 2 === 16) {
             setMemoryCleared(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIds([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const exitMemoryMode = () => {
    setIsMemoryMode(false);
  };

  const comboPercentage = (combo / MAX_COMBO) * 100;
  const isMaxCombo = combo >= MAX_COMBO;

  if (isMemoryMode) {
    return (
      <div className="bg-black/90 p-4 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] text-center w-full max-w-xs relative animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-600 pb-2">
           <h3 className="text-yellow-400 font-bold text-sm tracking-widest">SECRET: MEMORY</h3>
           <button onClick={exitMemoryMode} className="text-gray-400 hover:text-white">
             <RotateCcw size={16} />
           </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
              className={`
                w-12 h-12 flex items-center justify-center text-xl border-2 transition-all duration-300
                ${card.isFlipped || card.isMatched 
                  ? 'bg-white border-yellow-400 rotate-y-180' 
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }
                ${card.isMatched ? 'opacity-50' : 'opacity-100'}
              `}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : <span className="text-yellow-600 text-xs">?</span>}
            </button>
          ))}
        </div>

        {memoryCleared && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm flex-col">
              <div className="text-4xl animate-bounce mb-2">🎉</div>
              <div className="text-yellow-400 font-bold text-2xl mb-4">CLEAR!!</div>
              <button 
                onClick={initMemoryGame}
                className="bg-white text-black px-4 py-2 font-bold border-2 border-yellow-500 hover:bg-yellow-100"
              >
                REPLAY
              </button>
           </div>
        )}
        
        <div className="text-[10px] text-gray-500 font-mono">
           MATCH ALL PAIRS
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/90 p-4 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] text-center w-full max-w-xs animate-in fade-in zoom-in duration-300 relative overflow-hidden group">
      
      {/* Decorative Bananas */}
      <div className="absolute top-2 left-2 opacity-50 animate-bounce">
         <BananaIcon size={20} />
      </div>
      <div className="absolute top-2 right-2 opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}>
         <BananaIcon size={20} />
      </div>

      {/* HIDDEN MEMORY GAME TRIGGER (4x4 Grid) */}
      <div 
         onClick={initMemoryGame}
         className="absolute bottom-2 right-2 w-8 h-8 grid grid-cols-4 gap-0.5 opacity-10 hover:opacity-100 transition-opacity cursor-pointer z-10 p-0.5 border border-transparent hover:border-yellow-500/50 bg-black/50"
         title="???"
      >
         {Array.from({length: 16}).map((_, i) => (
            <div key={i} className="w-full h-full bg-yellow-400 rounded-[1px]"></div>
         ))}
      </div>

      <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2 mt-2">
        <Timer className="animate-pulse" />
        <span>{t.game_wait}</span>
      </div>
      
      <p className="text-white text-xs mb-4 font-bold">{t.game_desc}</p>

      {/* Timer Display */}
      <div className="bg-gray-800 border-2 border-gray-600 p-3 mb-2 font-mono text-3xl font-bold tracking-widest text-green-400 relative overflow-hidden">
        {time.toFixed(2)}s
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
           <div 
             className="h-full bg-yellow-400 transition-all duration-75" 
             style={{ width: `${Math.min((time / TARGET_TIME) * 100, 100)}%` }}
           />
        </div>
      </div>

      {/* Combo Gauge */}
      <div className="mb-4 px-1">
        <div className="flex justify-between text-[10px] text-yellow-500 font-bold mb-1 items-end">
            <span>COMBO GAUGE</span>
            <span className={isMaxCombo ? "text-red-500 animate-pulse text-xs" : ""}>
                {isMaxCombo ? "MAX POWER!!" : `${combo} / ${MAX_COMBO}`}
            </span>
        </div>
        <div className="w-full h-3 bg-gray-700 border border-gray-500 relative">
            <div 
                className={`h-full transition-all duration-300 ${isMaxCombo ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-cyan-300'}`}
                style={{ width: `${comboPercentage}%` }}
            />
            {/* Grid lines for gauge */}
            <div className="absolute inset-0 flex">
                <div className="w-1/5 h-full border-r border-black/20"></div>
                <div className="w-1/5 h-full border-r border-black/20"></div>
                <div className="w-1/5 h-full border-r border-black/20"></div>
                <div className="w-1/5 h-full border-r border-black/20"></div>
            </div>
        </div>
      </div>

      {result && (
        <div className={`text-xl font-bold mb-4 animate-bounce flex flex-col items-center ${result.includes('PERFECT') ? 'text-yellow-400' : 'text-white'}`}>
          <span>{result}</span>
          {result !== t.game_try && combo > 0 && (
             <span className="text-xs text-cyan-300 mt-1 font-mono tracking-wider flex items-center gap-1">
                 <Zap size={12} fill="currentColor" /> COMBO x{combo}
             </span>
          )}
        </div>
      )}

      <div className="flex justify-center">
        {status === 'idle' && (
           <button 
             onClick={handleStart}
             className="bg-yellow-400 text-black px-6 py-2 border-2 border-white font-bold hover:scale-105 active:scale-95 transition-transform"
           >
             {t.game_start}
           </button>
        )}
        
        {status === 'running' && (
           <button 
             onClick={handleStop}
             className="bg-red-500 text-white px-6 py-2 border-2 border-white font-bold hover:scale-105 active:scale-95 transition-transform"
           >
             {t.game_stop}
           </button>
        )}

        {status === 'stopped' && (
           <button 
             onClick={handleReset}
             className="bg-blue-500 text-white px-6 py-2 border-2 border-white font-bold hover:scale-105 active:scale-95 transition-transform"
           >
             {t.game_retry}
           </button>
        )}
      </div>
    </div>
  );
});
