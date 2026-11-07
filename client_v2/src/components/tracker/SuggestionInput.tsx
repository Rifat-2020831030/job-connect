"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/apiClient";
import { getUserInfo } from "@/lib/auth";

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  field: "title" | "company";
  placeholder?: string;
  disabled?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
  error?: string;
  className?: string;
  id?: string;
}

export default function SuggestionInput({
  value,
  onChange,
  onBlur,
  field,
  placeholder,
  disabled = false,
  isLocked = false,
  onUnlock,
  error,
  className = "",
  id,
}: SuggestionInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Optimization: Dead-end prefix tracking and query cache
  const deadEndPrefixRef = useRef<string | null>(null);
  const consecutiveEmptyRef = useRef<number>(0);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      const userInfo = getUserInfo();
      const trimmed = query.trim();
      const normalized = trimmed.toLowerCase();

      if (!userInfo || !trimmed) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      // If input continues down a known dead-end prefix, skip endpoint call
      if (deadEndPrefixRef.current && normalized.startsWith(deadEndPrefixRef.current)) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      // Check client-side query cache
      if (cacheRef.current.has(normalized)) {
        const cached = cacheRef.current.get(normalized)!;
        if (cached.length > 0) {
          setSuggestions(cached);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetchWithAuth(
          `/users/${userInfo.userId}/tracker-suggestions?field=${field}&q=${encodeURIComponent(
            trimmed
          )}`
        );
        const data = await res.json();
        const results =
          data.status === 1 && Array.isArray(data.data) ? data.data : [];

        // Cache the query results
        cacheRef.current.set(normalized, results);

        if (results.length > 0) {
          consecutiveEmptyRef.current = 0;
          deadEndPrefixRef.current = null;
          setSuggestions(results);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } else {
          consecutiveEmptyRef.current += 1;
          // After 2 consecutive empty results for extended inputs, mark as dead-end prefix
          if (consecutiveEmptyRef.current >= 2) {
            deadEndPrefixRef.current = normalized;
          }
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Error fetching tracker suggestions:", err);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [field]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedLower = newValue.trim().toLowerCase();

    // If user edited or backspaced away from the dead-end prefix, reset dead-end state
    if (
      deadEndPrefixRef.current &&
      !trimmedLower.startsWith(deadEndPrefixRef.current)
    ) {
      deadEndPrefixRef.current = null;
      consecutiveEmptyRef.current = 0;
    }

    if (isLocked || disabled || !newValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Skip scheduling call if currently in dead-end prefix
    if (
      deadEndPrefixRef.current &&
      trimmedLower.startsWith(deadEndPrefixRef.current)
    ) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 200);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 && !isLocked && !disabled) {
              setIsOpen(true);
            }
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLocked}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-lg p-2.5 text-sm transition-all focus:outline-none ${
            hasError
              ? "border border-red-500 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400"
              : "border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          } ${
            isLocked
              ? "disabled:bg-gray-50 disabled:text-gray-500 pr-10 cursor-not-allowed"
              : ""
          } ${isLoading ? "pr-8" : ""} ${className}`}
        />

        {isLoading && !isLocked && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {isLocked && onUnlock && (
          <button
            type="button"
            onClick={onUnlock}
            className="absolute right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer z-10 transition-colors"
            title="Unlock field to edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {hasError && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && !isLocked && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                type="button"
                key={`${suggestion}-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur before selection
                  handleSelectSuggestion(suggestion);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                  isHighlighted
                    ? "bg-emerald-50 text-emerald-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{suggestion}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
