"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function EnhancedThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setTheme(initialTheme);
    
    // Apply theme
    applyTheme(initialTheme);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    let actualTheme: "light" | "dark";
    
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Reverse the system preference (project's unique behavior)
      actualTheme = prefersDark ? "light" : "dark";
    } else {
      actualTheme = newTheme;
    }
    
    setIsDark(actualTheme === "dark");
    document.documentElement.setAttribute("data-theme", actualTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Add animation delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />;
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return "Light Theme";
      case "dark": return "Dark Theme";
      case "system": return "System (Reversed)";
    }
  };

  const getThemeDescription = () => {
    switch (theme) {
      case "light": return "Always light mode";
      case "dark": return "Always dark mode";
      case "system": return "Reverses your system preference";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {/* Theme buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleThemeChange("light")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === "light"
                ? "bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${isAnimating ? "scale-95" : ""}`}
            aria-label="Light theme"
            title="Light theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </button>
          
          <button
            onClick={() => handleThemeChange("dark")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === "dark"
                ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${isAnimating ? "scale-95" : ""}`}
            aria-label="Dark theme"
            title="Dark theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>
          
          <button
            onClick={() => handleThemeChange("system")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === "system"
                ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${isAnimating ? "scale-95" : ""}`}
            aria-label="System theme (reversed)"
            title="System theme (reverses your system preference)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M12 3v18" />
              <path d="M21 12H3" />
            </svg>
          </button>
        </div>
        
        {/* Quick toggle button */}
        <button
          onClick={cycleTheme}
          className={`p-3 rounded-full transition-all duration-500 ${
            isDark
              ? "bg-gradient-to-br from-purple-600 to-indigo-800 shadow-lg shadow-purple-500/30"
              : "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30"
          } ${isAnimating ? "rotate-180 scale-110" : "hover:scale-105"}`}
          aria-label="Cycle themes"
          title="Click to cycle through themes"
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Theme info */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getThemeLabel()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {getThemeDescription()}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Current: {isDark ? "🌙 Dark" : "☀️ Light"} mode
        </div>
      </div>
      
      {/* Animation indicator */}
      {isAnimating && (
        <div className="absolute -top-2 -right-2 w-4 h-4">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping" />
        </div>
      )}
    </div>
  );
}