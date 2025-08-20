import { useEffect, useState } from "react";

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [end, duration]);

  return count;
};

const StatCard = ({ label, value = 0, delay = 0 }) => {
  // Parse the number from string and handle different formats
  let numericValue = 0;
  let suffix = "";

  if (value) {
    // Handle formats like "10,000+", "5K+", "25M+", etc.
    const cleanValue = value.toString().replace(/,/g, "");
    const hasPlus = cleanValue.includes("+");
    suffix = hasPlus ? "+" : "";

    if (cleanValue.includes("M") || cleanValue.includes("m")) {
      numericValue = parseFloat(cleanValue.replace(/[Mm+]/g, "")) * 1000000;
    } else if (cleanValue.includes("K") || cleanValue.includes("k")) {
      numericValue = parseFloat(cleanValue.replace(/[Kk+]/g, "")) * 1000;
    } else {
      numericValue = parseInt(cleanValue.replace(/[+]/g, "")) || 0;
    }
  }

  const animatedCount = useCountUp(value, 2000 + delay);

  // Format the number back with appropriate suffix
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <div
      className="animate-fade-in-up w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
        {/* Number */}
        <div className="text-center">
          {value != 0 ? (
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {formatNumber(animatedCount)}
              {suffix}
            </div>
          ) : (
            <div className="bg-gray-400 animate-pulse rounded-lg h-8 sm:h-10 md:h-12 lg:h-14 w-24 sm:w-32 md:w-40 mx-auto mb-2"></div>
          )}

          {/* Label */}
          {label != null ? (
            <div className="text-gray-600 font-medium text-sm sm:text-base md:text-lg">
              {label}
            </div>
          ) : (
            <div className="bg-gray-400 animate-pulse rounded h-4 sm:h-5 md:h-6 w-20 sm:w-24 md:w-28 mx-auto"></div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-gray-100 rounded-full h-1 mt-3 overflow-hidden">
          {value != 0 ? (
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(
                  (animatedCount / numericValue) * 100,
                  100
                )}%`,
                transitionDelay: `${delay + 500}ms`,
              }}
            ></div>
          ) : (
            <div className="bg-gray-400 animate-pulse h-1 rounded-full w-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
