import React, { useRef, useEffect, useState } from 'react';
import type { AppState } from '../types';
import { PI_DIGITS } from '../constants';

interface PiCanvasProps {
  state: AppState;
  setDownloadTrigger: React.MutableRefObject<(() => void) | null>;
}

export const PiCanvas: React.FC<PiCanvasProps> = ({ state, setDownloadTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    digit: string;
    index: number;
    color: string;
  } | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { startDigit, digitCount, gridWidth, cellSize, palette } = state;
    
    // Calculate canvas size
    const cols = gridWidth;
    const rows = Math.ceil(digitCount / cols);
    const width = cols * cellSize;
    const height = rows * cellSize;

    // Set actual canvas size (for resolution)
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = '#111827'; // matches gray-900 background for transparency feel if needed, or clear
    ctx.fillRect(0, 0, width, height);

    // Slice Pi digits
    // Ensure we don't go out of bounds of our PI string source
    const safeStart = Math.min(startDigit, PI_DIGITS.length - 1);
    const safeEnd = Math.min(safeStart + digitCount, PI_DIGITS.length);
    const segment = PI_DIGITS.slice(safeStart, safeEnd);

    // Draw cells
    for (let i = 0; i < segment.length; i++) {
      const digit = segment[i];
      const color = palette[digit];
      
      const x = (i % cols) * cellSize;
      const y = Math.floor(i / cols) * cellSize;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  };

  useEffect(() => {
    draw();
  }, [state]);

  // Expose download function
  useEffect(() => {
    setDownloadTrigger.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `pi-art-${state.startDigit}-${state.digitCount}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }, [state]); // Re-bind if state changes (filename depends on state)

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling factors (in case canvas is resized by CSS)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Mouse position relative to canvas (intrinsic pixels)
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Grid coordinates
    const col = Math.floor(x / state.cellSize);
    const row = Math.floor(y / state.cellSize);

    // Check bounds
    if (col < 0 || col >= state.gridWidth || row < 0) {
      setTooltip(null);
      return;
    }

    const index = row * state.gridWidth + col;

    if (index >= 0 && index < state.digitCount) {
      const safeStart = Math.min(state.startDigit, PI_DIGITS.length - 1);
      const globalIdx = safeStart + index;
      
      if (globalIdx < PI_DIGITS.length) {
        const digit = PI_DIGITS[globalIdx];
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          digit: digit,
          index: globalIdx + 1, // 1-based index for humans
          color: state.palette[digit]
        });
        return;
      }
    }
    setTooltip(null);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="flex-1 h-full bg-gray-900 overflow-auto flex items-center justify-center p-8 relative">
       {/* Background Grid Pattern for style */}
       <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}>
       </div>

       <div className="relative shadow-2xl shadow-black ring-1 ring-gray-700 bg-black">
          <canvas 
            ref={canvasRef} 
            className="block cursor-crosshair"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
       </div>

       {tooltip && tooltip.visible && (
         <div 
           className="fixed pointer-events-none z-50 bg-gray-800/95 backdrop-blur border border-gray-600 rounded-lg shadow-xl p-3 flex flex-col gap-2 min-w-[140px]"
           style={{ 
             left: Math.min(tooltip.x + 16, window.innerWidth - 160), 
             top: Math.min(tooltip.y + 16, window.innerHeight - 120) 
           }}
         >
           <div className="flex items-center justify-between border-b border-gray-700 pb-1 mb-1">
             <span className="text-gray-400 text-xs uppercase tracking-wide">Digit</span>
             <span className="text-white font-bold text-lg leading-none">{tooltip.digit}</span>
           </div>
           
           <div className="space-y-1">
             <div className="flex justify-between text-xs">
               <span className="text-gray-400">Position</span>
               <span className="text-gray-200 font-mono">#{tooltip.index}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-gray-400">Color</span>
               <div className="flex items-center gap-1">
                 <div 
                   className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/10" 
                   style={{ backgroundColor: tooltip.color }}
                 />
                 <span className="text-gray-200 font-mono uppercase">{tooltip.color}</span>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};