import React, { useState } from 'react';
import type { AppState, Palette } from '../types';
import { ColorPicker } from './ColorPicker';
import { generatePalette } from '../services/gemini';
import { Loader2, Sparkles, Download, RefreshCw, Undo2 } from 'lucide-react';
import { PI_DIGITS, DEFAULT_PALETTE, PASTEL_PALETTE, MONOCHROME_PALETTE } from '../constants';

interface ControlPanelProps {
  state: AppState;
  onUpdate: (newState: Partial<AppState>) => void;
  onDownload: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, onUpdate, onDownload }) => {
  const [themePrompt, setThemePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleColorChange = (digit: string, color: string) => {
    onUpdate({
      palette: { ...state.palette, [digit]: color }
    });
  };

  const handleAiGenerate = async () => {
    if (!themePrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newPalette = await generatePalette(themePrompt);
      onUpdate({ palette: newPalette });
    } catch (e) {
      setError("Failed to generate palette. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyPreset = (preset: Palette) => {
      onUpdate({ palette: preset });
  }

  // Calculate the maximum safe starting digit
  const maxStart = Math.max(0, PI_DIGITS.length - state.digitCount);

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-gray-800 border-r border-gray-700 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
           <span className="text-3xl">π</span> Pi-casso
        </h1>
        <p className="text-xs text-gray-400 mt-1">Generative Art from Infinite Digits</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* Dimensions Control */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Canvas & Grid</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex justify-between">
              <span>Start Digit</span>
              <span className="text-white font-mono">{state.startDigit}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max={maxStart}
              step="10"
              value={state.startDigit}
              onChange={(e) => onUpdate({ startDigit: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex justify-between">
              <span>Total Digits</span>
              <span className="text-white font-mono">{state.digitCount}</span>
            </label>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="50"
              value={state.digitCount}
              onChange={(e) => onUpdate({ digitCount: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex justify-between">
              <span>Grid Width (Columns)</span>
              <span className="text-white font-mono">{state.gridWidth}</span>
            </label>
             <input 
              type="range" 
              min="10" 
              max="200" 
              step="1"
              value={state.gridWidth}
              onChange={(e) => onUpdate({ gridWidth: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
           <div className="space-y-2">
            <label className="text-xs text-gray-400 flex justify-between">
              <span>Cell Size (px)</span>
              <span className="text-white font-mono">{state.cellSize}</span>
            </label>
             <input 
              type="range" 
              min="2" 
              max="40" 
              step="1"
              value={state.cellSize}
              onChange={(e) => onUpdate({ cellSize: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Palette Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Color Palette</h3>
             <div className="flex gap-2">
                <button onClick={() => applyPreset(DEFAULT_PALETTE)} className="p-1 hover:bg-gray-700 rounded" title="Reset Default"><Undo2 size={14}/></button>
                <button onClick={() => applyPreset(PASTEL_PALETTE)} className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-300 to-blue-300 ring-1 ring-white/20" title="Pastel"></button>
                <button onClick={() => applyPreset(MONOCHROME_PALETTE)} className="w-4 h-4 rounded-full bg-gradient-to-br from-black to-white ring-1 ring-white/20" title="Monochrome"></button>
             </div>
          </div>

          <div className="grid grid-cols-5 gap-y-4 gap-x-2">
            {Object.keys(state.palette).map((digit) => (
              <ColorPicker 
                key={digit} 
                digit={digit} 
                color={state.palette[digit]} 
                onChange={handleColorChange} 
              />
            ))}
          </div>

           {/* AI Generator */}
          <div className="pt-4 border-t border-gray-700 space-y-3">
             <label className="text-xs text-blue-400 font-semibold flex items-center gap-1">
               <Sparkles size={12} /> AI Palette Generator
             </label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={themePrompt}
                 onChange={(e) => setThemePrompt(e.target.value)}
                 placeholder="e.g., Cyberpunk, Ocean..."
                 className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                 onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
               />
               <button 
                 onClick={handleAiGenerate}
                 disabled={isGenerating || !themePrompt}
                 className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded flex items-center justify-center transition-colors"
               >
                 {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
               </button>
             </div>
             {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-900 border-t border-gray-700">
         <button 
           onClick={onDownload}
           className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
         >
           <Download size={18} /> Download Art
         </button>
      </div>
    </div>
  );
};