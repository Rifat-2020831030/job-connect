"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && wrapperRef.current.contains(e.target as Node)) {
        return;
      }
      
      // If the dropdown is open, a mousedown here means it's outside
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on scroll or resize when open to avoid floating disconnected menu
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true); // capture all scrolls
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && wrapperRef.current) {
      setRect(wrapperRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  const portalContent = isOpen && rect ? (
    <div
      style={{
        position: "fixed",
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()} 
    >
      <ul className="w-full bg-white border border-gray-100 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto custom-scrollbar">
        {options.map((opt) => (
          <li
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
          >
            {opt.label}
            {opt.value === value && (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // Render portal only on client to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {mounted && portalContent && createPortal(portalContent, document.body)}
    </div>
  );
}
