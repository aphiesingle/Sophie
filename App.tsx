import React, { useState, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PiCanvas } from './components/PiCanvas';
import type { AppState } from './types';
import { DEFAULT_PALETTE } from './constants';
import { Menu, X } from 'lucide-react';

const INITIAL_STATE: AppState = {
  startDigit: 0,
  digitCount: 1000,
  gridWidth: 50,
  cellSize: 12,
  palette: DEFAULT_PALETTE
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const downloadTriggerRef = useRef<(() => void) | null>(null);

  const handleUpdate = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleDownload = () => {
    if (downloadTriggerRef.current) {
      downloadTriggerRef.current();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900 relative">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar / Control Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-xl md:shadow-none
      `}>
        <ControlPanel 
          state={state} 
          onUpdate={handleUpdate} 
          onDownload={handleDownload}
        />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full relative flex flex-col min-w-0">
        <PiCanvas state={state} setDownloadTrigger={downloadTriggerRef} />
        
        {/* Info Overlay */}
        <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur border border-gray-700 px-4 py-2 rounded-lg text-xs text-gray-400 pointer-events-none">
           <span className="font-mono text-white">Grid: {state.gridWidth}x{Math.ceil(state.digitCount/state.gridWidth)}</span>
           <span className="mx-2">•</span>
           <span className="font-mono text-white">{state.digitCount} Digits</span>
        </div>
      </main>
    </div>
  );
}