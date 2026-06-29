import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS, readJSON, writeJSON } from '../storage';
import { lightTheme, darkTheme } from '../theme/tokens';

const ThemeContext = createContext(null);

// Holds the active colour scheme and persists the user's choice. The default is
// light until the saved preference is read back on mount.
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    readJSON(STORAGE_KEYS.theme).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleTheme = () => {
    setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      writeJSON(STORAGE_KEYS.theme, next);
      return next;
    });
  };

  const value = useMemo(() => ({
    mode,
    isDark: mode === 'dark',
    theme: mode === 'dark' ? darkTheme : lightTheme,
    toggleTheme,
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
