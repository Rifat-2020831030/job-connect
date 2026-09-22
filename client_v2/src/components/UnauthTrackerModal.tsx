import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface UnauthTrackerModalProps {
  onClose: () => void;
  onProceedAnyway: () => void;
}

export default function UnauthTrackerModal({ onClose, onProceedAnyway }: UnauthTrackerModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onProceedAnyway();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onProceedAnyway]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#131b2e]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container with Animated Border */}
      <div className="relative bg-white w-full max-w-sm rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Progress Border Top */}
        <div 
          className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 5) * 100}%` }}
        />

        <div className="p-6 flex flex-col items-center text-center gap-4 mt-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900">
            Redirecting in {timeLeft}s...
          </h3>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            To automatically track your job applications, log in next time!
          </p>

          <button 
            onClick={onProceedAnyway}
            className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-md transition-colors cursor-pointer text-sm"
          >
            Proceed Now
          </button>
        </div>
      </div>
    </div>
  );
}
