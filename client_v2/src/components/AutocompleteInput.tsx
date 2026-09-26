import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = "",
  disabled = false,
  onBlur,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const displayOptions = showAll 
    ? options 
    : options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowAll(false);
          setIsOpen(true);
        }}
        onFocus={() => {
          setShowAll(true);
          setIsOpen(true);
        }}
        onBlur={() => {
          // Fire onBlur after a tiny delay so click on suggestion can process
          setTimeout(() => {
            if (onBlur) onBlur();
          }, 150);
        }}
        placeholder={placeholder}
        disabled={disabled}
      />
      {!disabled && (
        <button
          type="button"
          onClick={() => {
            setShowAll(true);
            setIsOpen(!isOpen);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {isOpen && !disabled && displayOptions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
          {displayOptions.map((opt, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
