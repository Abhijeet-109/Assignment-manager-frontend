// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// Theme enum — future: Light | Dark | System Default
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || THEMES.LIGHT; // default: light
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t) => {
      if (t === THEMES.SYSTEM) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', t);
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system preference changes when theme === 'system'
    if (theme === THEMES.SYSTEM) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme(THEMES.SYSTEM);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);