import React from 'react';

interface ColorPickerProps {
  digit: string;
  color: string;
  onChange: (digit: string, color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ digit, color, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10 rounded-lg overflow-hidden ring-1 ring-gray-600 hover:ring-blue-400 transition-all">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(digit, e.target.value)}
          className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer"
        />
      </div>
      <span className="text-xs font-mono text-gray-400 font-bold">{digit}</span>
    </div>
  );
};
