import React, { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

type ColorPickerProps = {
  placeholder?: string;
  onChange: (value: string) => void;
  modalId?: string;
  value?: string;
  className?: string;
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  placeholder = "Select Color",
  onChange,
  modalId,
  value,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(value || "");
  const [customColor, setCustomColor] = useState<string>("#3B82F6");
  const selectRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Predefined colors with better organization
  const predefinedColors = [
    "#3B82F6", "#1D4ED8", "#1E40AF", // Blues
    "#EF4444", "#DC2626", "#B91C1C", // Reds
    "#10B981", "#059669", "#047857", // Greens
    "#F59E0B", "#D97706", "#B45309", // Oranges
    "#8B5CF6", "#7C3AED", "#6D28D9", // Purples
    "#EC4899", "#DB2777", "#BE185D", // Pinks
    "#06B6D4", "#0891B2", "#0E7490", // Cyans
    "#84CC16", "#65A30D", "#4D7C0F", // Limes
    "#F97316", "#EA580C", "#C2410C", // Orange variants
    "#6366F1", "#4F46E5", "#4338CA", // Indigos
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    onChange(color);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectRef.current) return;
      
      const target = event.target as Node;
      
      if (selectRef.current.contains(target)) {
        return;
      }
      
      if (modalId) {
        const modalElement = document.querySelector(`[data-modal-id="${modalId}"]`) || 
                            document.querySelector('.dialog') || 
                            document.querySelector('[role="dialog"]');
        
        if (modalElement && modalElement.contains(target)) {
          const clickedElement = target as Element;
          
          if (clickedElement.tagName === 'INPUT' || 
              clickedElement.tagName === 'BUTTON' || 
              clickedElement.tagName === 'TEXTAREA' ||
              clickedElement.closest('input') ||
              clickedElement.closest('button') ||
              clickedElement.closest('.react-datepicker') ||
              clickedElement.closest('[role="button"]')) {
            setIsOpen(false);
            return;
          }
          
          return;
        }
      }
      
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, modalId]);

  useEffect(() => {
    if (value && value !== selectedColor) {
      setSelectedColor(value);
      if (!predefinedColors.includes(value)) {
        setCustomColor(value);
      }
    }
  }, [value, selectedColor, predefinedColors]);

  return (
    <div className={`relative w-52 ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full focus:border-2 border focus:border-blue-500 border-gray-400 text-left px-3 py-2.5 rounded-md focus:outline-none hover:border-gray-500 transition-colors"
      >
        {selectedColor ? (
          <div className="flex items-center gap-2">
            <span 
              className="h-4 w-4 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-gray-700 text-sm">{selectedColor}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-gray-300 bg-gray-100" />
            <span className="text-gray-500 text-sm">{placeholder}</span>
          </div>
        )}
        <FaAngleDown className="text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-80 overflow-auto">
          {/* Predefined Colors Grid */}
          <div className="p-3">
            <div className="text-xs font-medium text-gray-600 mb-2">Predefined Colors</div>
            <div className="grid grid-cols-5 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                    selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Custom Color Picker */}
          <div className="border-t border-gray-200 p-3">
            <div className="text-xs font-medium text-gray-600 mb-2">Custom Color</div>
            <div className="flex items-center gap-2">
              <input
                ref={colorInputRef}
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                title="Pick custom color"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const color = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
                    setCustomColor(color);
                    setSelectedColor(color);
                    onChange(color);
                  }
                }}
                placeholder="#3B82F6"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;