// client/src/components/ThemeToggle.jsx
import React, { useEffect, useState, useRef } from "react";

/**
 * ThemeToggle
 * - toggles between light and dark
 * - shows tooltip "Sun" or "Crescent moon" on hover
 * - exposes window.setDarkVariant('alt'|'default') to switch dark palette programmatically
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const btnRef = useRef();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // update tooltip text
    setTooltipText(theme === "dark" ? "Dark" : "Light");

    // persist user preference
    try { localStorage.setItem("theme", theme); } catch (e) {}

    // expose small helper to switch dark palette variant
    window.setDarkVariant = (variant = "default") => {
      if (variant === "alt") {
        document.documentElement.setAttribute("data-theme-variant", "alt");
      } else {
        document.documentElement.removeAttribute("data-theme-variant");
      }
    };
  }, [theme]);

  // on mount, read stored preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) setTheme(stored);
    } catch (e) {}
  }, []);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  // small animation class when hovering
  const handleMouseEnter = () => setTooltipVisible(true);
  const handleMouseLeave = () => setTooltipVisible(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={btnRef}
        className="theme-toggle-btn"
        aria-pressed={theme === "dark"}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={toggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={tooltipText} /* native tooltip as fallback */
      >
        {/* simple sun / moon icons (svg) — animated with CSS */}
        <span className={`tt-icon ${theme === "dark" ? "moon" : "sun"}`} aria-hidden="true">
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
            </svg>
          )}
        </span>
      </button>

      {/* tooltip element (animated) */}
      <div
        className={`theme-tooltip ${tooltipVisible ? "visible" : ""}`}
        role="status"
        aria-hidden={!tooltipVisible}
      >
        <div className="theme-tooltip-inner">
          {tooltipText}
        </div>
      </div>
    </div>
  );
}


