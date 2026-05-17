import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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

  const navLinks = [
    {
      to: "/#data-job-search",
      label: "Find Jobs",
    },
    {
      to: "/companies",
      label: "Companies",
    },
    {
      to: "/salary",
      label: "Salary Guide",
    },
    {
      to: "/experience",
      label: "Interview Experience",
    },
  ];

  return (
    <>
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-4 bg-gray-900 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-blue-600">&lt;//&gt;</span>
              <span className="text-white ml-1">ChakriLagbe</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 font-sans">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-medium transition-colors ${
                    isActive
                      ? "text-blue-300"
                      : "text-white hover:text-blue-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Buy Me Coffee Button */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/coming-soon"
              className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-500 hover:to-blue-800 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <img src={coffeeMug} alt="Coffee Mug" className="w-4 h-4" />
              <span>Buy me coffee</span>
            </NavLink>
          </div>

          {/* Mobile: Buy Me Coffee Button + Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Buy Me Coffee Button */}
            <NavLink
              to="/coming-soon"
              className="bg-blue-300 hover:bg-blue-500 text-white font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center shadow-md"
            >
              <img src={coffeeMug} alt="Coffee Mug" className="w-4 h-4" />
            </NavLink>

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
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center text-gray-700 hover:text-white hover:bg-blue-300 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-lg group ${
                          isActive ? "bg-blue-300 text-white" : ""
                        }`
                      }
                      onClick={toggleMenu}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <NavLink
                  to="/coming-soon"
                  onClick={toggleMenu}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-500 hover:to-blue-800 text-white font-medium px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <img src={coffeeMug} alt="Coffee Mug" className="w-5 h-5" />
                  <span>Buy me coffee</span>
                </NavLink>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
