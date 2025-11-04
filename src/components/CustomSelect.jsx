import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ 
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  error,
  className = "",
  labelStyle = {
    fontFamily: "Lato, sans-serif",
    fontSize: "10px",
    fontWeight: "bold",
    color: "#535964",
  },
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Encontra o label da opção selecionada
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="w-full">
      {label && (
        <label 
          className="block mb-2"
          style={labelStyle}
        >
          {label}
        </label>
      )}
      <div className={`relative ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className={`w-full text-left py-2 px-3 pr-8 text-sm rounded border ${error ? 'border-red-500' : 'border-[#E3E5E8]'} bg-white flex items-center justify-between focus:outline-none`}
        >
          <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayText}
          </span>
          <ChevronDown className="text-gray-400" size={16} />
        </button>

        {isOpen && (
          <ul className="absolute left-0 mt-1 z-50 w-full max-h-56 overflow-auto bg-white border border-[#E3E5E8] rounded shadow-lg" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value === option.value ? 'bg-blue-50' : ''}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomSelect;