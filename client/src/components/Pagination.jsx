import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const [inputPage, setInputPage] = useState("");

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
    setInputPage("");
  };

  const getVisiblePages = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center space-x-4">
      {/* Previous Icon */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`focus:outline-none ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-violet-500 hover:text-violet-700"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {/* First Page */}
        {!visiblePages.includes(1) && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={`px-3 py-1 rounded-md ${
                1 === currentPage
                  ? "bg-violet-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              1
            </button>
            {!visiblePages.includes(2) && (
              <span className="px-3 py-1">...</span>
            )}
          </>
        )}

        {/* Visible Pages */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? "bg-violet-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last Page */}
        {!visiblePages.includes(totalPages) && (
          <>
            {!visiblePages.includes(totalPages - 1) && (
              <span className="px-3 py-1">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${
                totalPages === currentPage
                  ? "bg-violet-500 text-white"
                  : "bg-violet-200 hover:bg-violet-300"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Icon */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`focus:outline-none ${
          currentPage === totalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-violet-500 hover:text-violet-700"
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-8 w-8" />
      </button>

      {/* Page Input (for larger screens) */}
      {totalPages > 10 && (
        <form
          onSubmit={handleInputSubmit}
          className="hidden sm:flex items-center space-x-2"
        >
          <span className="text-sm text-gray-600">Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-16 px-2 py-1 border rounded-md text-sm"
            placeholder="Page"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
};

export default Pagination;
