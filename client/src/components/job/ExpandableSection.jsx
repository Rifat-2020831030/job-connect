const ExpandableSection = ({
  title,
  icon,
  items,
  isExpanded,
  onToggle,
  colorClass,
  previewCount = 3,
}) => {
  if (!items || items.length === 0) return null;

  // Ensure items is always an array before using map
  const itemsArray = Array.isArray(items) ? items : [items];

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center">
          {icon}
          {title} ({itemsArray.length})
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`mt-2 overflow-hidden transition-all duration-400 ease-linear opacity-${
          isExpanded ? "100" : "0"
        }}`}
        style={{
          maxHeight: isExpanded ? `${itemsArray.length * 60}px` : "0px",
          transition: "max-height 0.4s ease, opacity 0.4s ease",
        }}
      >
        <div className="flex flex-wrap gap-2">
          {itemsArray
            .slice(0, isExpanded ? itemsArray.length : previewCount)
            .map((item, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-md font-medium ${colorClass}`}
              >
                {item}
              </span>
            ))}
          {!isExpanded && itemsArray.length > previewCount && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
              +{itemsArray.length - previewCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandableSection;
