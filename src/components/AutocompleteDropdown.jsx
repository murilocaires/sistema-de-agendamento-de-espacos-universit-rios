import React from "react";

const AutocompleteDropdown = ({
  isOpen,
  suggestions,
  onSelect,
  onClose,
  position = { top: "100%", left: "0" },
}) => {
  if (!isOpen || !suggestions.length) return null;

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div className="fixed inset-0 z-10" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute z-20 bg-gray-900 rounded-lg shadow-xl border border-gray-700 min-w-full max-w-xs"
        style={{
          top: position.top,
          left: position.left,
          right: position.right,
        }}
      >
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors text-sm"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AutocompleteDropdown;
