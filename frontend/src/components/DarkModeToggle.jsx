import React, { useEffect, useState } from 'react';

const getInitialTheme = () => {
  if (typeof window === "undefined") return true; // Default to dark for SSR
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return true; // Default to dark when no preference is set
};

const DarkModeToggle = ({ mobile = false }) => {
  const [dark, setDark] = useState(getInitialTheme);

  // Listen to system preference changes if user never explicitly set
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    if (!stored) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const systemListener = (e) => setDark(e.matches);
      media.addEventListener("change", systemListener);
      return () => media.removeEventListener("change", systemListener);
    }
  }, []);

  // Apply dark mode class and store preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (mobile) {
    return (
      <button
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-md
          bg-white/60 dark:bg-gray-800/60
          border border-cyan-400/40 hover:border-cyan-400/60
          transition-all duration-150
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-1 focus:ring-cyan-400
        "
        onClick={() => setDark(!dark)}
        type="button"
      >
        {dark ? (
          <div className="text-cyan-500 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.5"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          <div className="text-cyan-600 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        left: 'auto',
        bottom: 'auto',
        zIndex: 50
      }}
      className="
        hidden md:flex
        bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black
        border-2 border-cyan-400/60 hover:border-cyan-400
        rounded-full shadow-lg hover:shadow-cyan-400/30 p-3
        transition-all duration-150
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-cyan-400
        group relative overflow-hidden
      "
      onClick={() => setDark(!dark)}
      type="button"
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-cyan-500/10 dark:from-cyan-400/20 dark:to-cyan-500/20 rounded-full group-hover:from-cyan-400/20 group-hover:to-cyan-500/20 dark:group-hover:from-cyan-400/30 dark:group-hover:to-cyan-500/30 transition-all duration-150"></div>
      
      {/* Icon container */}
      <div className="relative flex items-center justify-center w-6 h-6">
        {dark ? (
          // Show modern sun icon for switching to light mode
          <div className="text-cyan-400 animate-pulse-scale">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-transform duration-150 group-hover:rotate-45">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.6"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          // Show modern moon icon for switching to dark mode  
          <div className="text-cyan-600 animate-pulse-scale">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-transform duration-150 group-hover:-rotate-12">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.6"/>
              <circle cx="17" cy="7" r="1" fill="currentColor" opacity="0.8"/>
              <circle cx="19" cy="11" r="0.5" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};

export default DarkModeToggle;
