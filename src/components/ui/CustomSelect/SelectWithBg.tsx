import React, { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

type Option = {
  label: string;
  value: string;
  bgColor: string; // Just the color name like "red-500"
};

type CustomSelectProps = {
  placeholder?: string;
  onChange: (value: string) => void;
  modalId?: string; // ID of the parent modal to exclude from outside click detection
  value?: string; // Add value prop for controlled component
};

const SelectWithBg: React.FC<CustomSelectProps> = ({
 
  placeholder = "Default",
  onChange,
  modalId,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | any>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectRef.current) return;
      
      const target = event.target as Node;
      
   
      if (selectRef.current.contains(target)) {
        return;
      }
      
      // Don't close if click is on scrollbar or modal elements
      if (modalId) {
        const modalElement = document.querySelector(`[data-modal-id="${modalId}"]`) || 
                            document.querySelector('.dialog') || 
                            document.querySelector('[role="dialog"]');
        
        if (modalElement && modalElement.contains(target)) {
          // Check if the click is specifically on form elements or scrollbar
          const clickedElement = target as Element;
          
          // Allow clicks on form inputs, buttons, and other interactive elements
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
      
      // Close for clicks completely outside the modal
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, modalId]);

  const options = [
        
    // { label: "blue-200", value: "blue-200", bgColor: "blue-200" },
    { label: "blue-400", value: "blue-400", bgColor: "blue-400" },
    { label: "blue-800", value: "blue-800", bgColor: "blue-800" },
    
    // { label: "rose-200", value: "red-200", bgColor: "rose-200" },
    { label: "rose-400", value: "red-400", bgColor: "rose-400" },
    { label: "rose-800", value: "red-800", bgColor: "rose-800" },
    
    // { label: "fuchsia-200", value: "fuchsia-200", bgColor: "fuchsia-200" },
    { label: "fuchsia-400", value: "fuchsia-400", bgColor: "fuchsia-400" },
    { label: "fuchsia-800", value: "fuchsia-800", bgColor: "fuchsia-800" },
    
    // { label: "orange-200", value: "orange-200", bgColor: "orange-200" },
    { label: "orange-400", value: "orange-400", bgColor: "orange-400" },
    { label: "orange-800", value: "orange-800", bgColor: "orange-800" },
    
    // { label: "green-200", value: "green-200", bgColor: "green-200" },
    { label: "green-400", value: "green-400", bgColor: "green-400" },
    { label: "green-800", value: "green-800", bgColor: "green-800" },

    { label: "cyan-400", value: "cyan-400", bgColor: "cyan-400" },
    { label: "cyan-800", value: "cyan-800", bgColor: "cyan-800" },

    { label: "pink-400", value: "pink-400", bgColor: "pink-400" },
    { label: "pink-800", value: "pink-800", bgColor: "pink-800" },
  ];

  // Effect to set initial value based on value prop
  useEffect(() => {
    if (value && !selected) {
      const initialOption = options.find(option => option.value === value);
      if (initialOption) {
        setSelected(initialOption);
      }
    }
  }, [value, options, selected]);

  return (
    <div className="relative w-52" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full focus:border-2 border focus:border- border-[#4B5563] text-left px-[0.75rem] py-[0.7rem] rounded-md focus:outline-none"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full bg-${selected.bgColor}`}></span>
            <span className="text-gray-700">{selected.label}</span>
          </div>
        ) : (
            <div className="flex items-center gap-2">
            {placeholder !== 'Select...' && <span className={`h-3 w-3 rounded-full bg-${placeholder}`}></span>}
            <span className="text-gray-700 opacity-75">{!placeholder ? 'Select...' : placeholder}</span>
          </div>
        )}
        <span className=""><FaAngleDown/></span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((option:any) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 cursor-pointer hover:opacity-80 text-white flex items-center gap-2`}
            >
              <span className={`h-3 w-3 rounded-full bg-${option.bgColor}`}></span>
              <span className="text-gray-600">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectWithBg;