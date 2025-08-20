import { useEffect, useState } from "react";
import coffeeMug from "../assets/coffee.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsAnimating(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsAnimating(false);
      }, 300);
    } else {
      // Start opening animation
      setIsMenuOpen(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".mobile-menu-container")) {
        if (isMenuOpen) {
          setIsAnimating(true);
          setTimeout(() => {
            setIsMenuOpen(false);
            setIsAnimating(false);
          }, 300);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsMenuOpen(false);
          setIsAnimating(false);
        }, 300);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("no-scroll");
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-blue-600">&lt;//&gt;</span>
              <span className="text-gray-800 ml-1">ChakriLagbe</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#jobs"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Find Jobs
            </a>
            <a
              href="#companies"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Companies
            </a>
            <a
              href="#salary"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Salary Guide
            </a>
            <a
              href="#blog"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Blog
            </a>
          </div>

          {/* Desktop Buy Me Coffee Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg">
              <img src={coffeeMug} alt="Coffee Mug" className="w-4 h-4" />
              <span>Buy me coffee</span>
            </button>
          </div>

          {/* Mobile: Buy Me Coffee Button + Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Buy Me Coffee Button */}
            <button className="bg-blue-300 hover:bg-blue-500 text-white font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center shadow-md">
              <img src={coffeeMug} alt="Coffee Mug" className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
              disabled={isAnimating}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  isMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Panel Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`mobile-menu-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
              isMenuOpen && !isAnimating ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Side Panel */}
          <div
            className={`mobile-menu-container mobile-menu-panel fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${
              isMenuOpen && !isAnimating ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="text-xl font-bold">
                  <span className="text-blue-600">&lt;/&gt;</span>
                  <span className="text-gray-800 ml-1">CodeConnect</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white/70"
                  aria-label="Close menu"
                  disabled={isAnimating}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-8">
                <div className="space-y-2">
                  <a
                    href="#jobs"
                    className="flex items-center text-gray-700 hover:text-white hover:bg-blue-300 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-lg group"
                    onClick={toggleMenu}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8"
                      />
                    </svg>
                    Find Jobs
                  </a>
                  <a
                    href="#companies"
                    className="flex items-center text-gray-700 hover:text-white hover:bg-blue-300 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-lg group"
                    onClick={toggleMenu}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Companies
                  </a>
                  <a
                    href="#salary"
                    className="flex items-center text-gray-700 hover:text-white hover:bg-blue-300 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-lg group"
                    onClick={toggleMenu}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Salary Guide
                  </a>
                  <a
                    href="#blog"
                    className="flex items-center text-gray-700 hover:text-white hover:bg-blue-300 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-lg group"
                    onClick={toggleMenu}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    Blog
                  </a>
                </div>
              </div>

              {/* Footer with full-width Buy Me Coffee button */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button className="w-full bg-blue-300 hover:bg-blue-500 text-white font-medium px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <img src={coffeeMug} alt="Coffee Mug" className="w-5 h-5" />
                  <span>Buy me coffee</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
