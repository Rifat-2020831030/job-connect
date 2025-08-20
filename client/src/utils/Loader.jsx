import { useEffect } from "react";

const Loader = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="loader">
            <svg viewBox="0 0 80 80">
              <circle r="32" cy="40" cx="40" id="test"></circle>
            </svg>
          </div>

          <div className="loader triangle">
            <svg viewBox="0 0 86 80">
              <polygon points="43 8 79 72 7 72"></polygon>
            </svg>
          </div>

          <div className="loader">
            <svg viewBox="0 0 80 80">
              <rect height="64" width="64" y="8" x="8"></rect>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
