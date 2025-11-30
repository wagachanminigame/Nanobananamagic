import React, { useEffect, useRef, useState } from 'react';
import { BananaIcon } from './BananaIcon';

interface MiniGameProps {
  enemyImageUrl: string;
  onClose: () => void;
}

export const MiniGame: React.FC<MiniGameProps> = ({ enemyImageUrl, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Game state refs
  const playerPos = useRef({ x: 150 });
  const bullets = useRef<{ x: number; y: number }[]>([]);
  const enemies = useRef<{ x: number; y: number; speed: number; size: number }[]>([]);
  const frameRef = useRef<number>(0);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load enemy image
    const img = new Image();
    img.src = enemyImageUrl;
    img.onload = () => {
      enemyImageRef.current = img;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Control handlers
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (gameOver) return;
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }
      const x = clientX - rect.left;
      // Keep player within bounds
      playerPos.current.x = Math.max(20, Math.min(x, 280));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);

    // Game Loop
    const loop = () => {
      if (gameOver) return;
      
      // Update logic
      // 1. Spawn Enemies
      if (Math.random() < 0.03) {
        enemies.current.push({
          x: Math.random() * 260 + 20,
          y: -40,
          speed: Math.random() * 2 + 1 + (score / 100), // Speed up with score
          size: 40
        });
      }

      // 2. Spawn Bullets (Auto fire)
      if (frameRef.current % 15 === 0) {
        bullets.current.push({
           x: playerPos.current.x,
           y: 380
        });
      }

      // 3. Move Bullets
      bullets.current = bullets.current.filter(b => b.y > -10);
      bullets.current.forEach(b => b.y -= 7);

      // 4. Move Enemies
      enemies.current.forEach(e => e.y += e.speed);

      // 5. Collision Detection
      // Bullet vs Enemy
      bullets.current.forEach((b, bIdx) => {
        enemies.current.forEach((e, eIdx) => {
           const dist = Math.hypot(b.x - e.x, b.y - e.y);
           if (dist < e.size / 2 + 5) {
             // Hit!
             enemies.current.splice(eIdx, 1);
             bullets.current.splice(bIdx, 1);
             setScore(s => s + 10);
           }
        });
      });

      // Enemy vs Player (Game Over) or Floor
      enemies.current.forEach(e => {
         if (e.y > 400) {
            // Missed enemy - penalty? or just remove
            enemies.current = enemies.current.filter(en => en !== e);
         }
         // Simple hitbox for player
         const distPlayer = Math.hypot(e.x - playerPos.current.x, e.y - 380);
         if (distPlayer < 30) {
            setGameOver(true);
         }
      });

      // Draw
      ctx.fillStyle = '#1a1a1a'; // Dark retro bg
      ctx.fillRect(0, 0, 300, 400);

      // Draw Stars/Grid
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      for(let i=0; i<300; i+=20) { ctx.moveTo(i,0); ctx.lineTo(i,400); }
      for(let i=0; i<400; i+=20) { ctx.moveTo(0,i); ctx.lineTo(300,i); }
      ctx.stroke();

      // Draw Player (Banana Ship)
      ctx.save();
      ctx.translate(playerPos.current.x, 380);
      // Simple Banana Shape
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.quadraticCurveTo(10, 0, 0, 15);
      ctx.quadraticCurveTo(-10, 0, 0, -15);
      ctx.fill();
      ctx.restore();

      // Draw Bullets
      ctx.fillStyle = '#FFF';
      bullets.current.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 2, 4, 8);
      });

      // Draw Enemies (The Generated Image)
      enemies.current.forEach(e => {
         ctx.save();
         ctx.translate(e.x, e.y);
         // Spin effect
         ctx.rotate(frameRef.current * 0.05);
         if (enemyImageRef.current) {
            ctx.beginPath();
            ctx.arc(0,0, e.size/2, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(enemyImageRef.current, -e.size/2, -e.size/2, e.size, e.size);
         } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(-15, -15, 30, 30);
         }
         ctx.restore();
      });

      frameRef.current++;
      requestAnimationFrame(loop);
    };

    const animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [gameOver]); // Re-run if game over changes, effectively stopping logic updates but we want to stop loop? 
                  // Actually the loop checks gameOver flag.

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-black p-2 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between text-yellow-400 font-mono mb-2 px-2 font-bold text-xl">
           <span>SCORE: {score}</span>
           <span>HIT THE IMAGE!</span>
        </div>
        
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={400} 
            className="bg-gray-900 cursor-crosshair touch-none"
          />
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
               <h2 className="text-4xl text-red-500 font-bold mb-4 animate-bounce">GAME OVER</h2>
               <p className="text-white text-xl mb-6">FINAL SCORE: {score}</p>
               <button 
                 onClick={onClose}
                 className="bg-yellow-400 text-black px-6 py-3 font-bold border-4 border-white hover:scale-105 transition-transform"
               >
                 EXIT GAME
               </button>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center text-xs text-gray-400 font-mono">
           MOUSE/TOUCH TO MOVE • AUTO FIRE
        </div>
      </div>
    </div>
  );
};
