import { createContext, useContext, useEffect, useState } from 'react';

// Dark/light theme for the whole app. Components never hold their own colors;
// they use the CSS variables in theme.css, which this provider flips by setting
// data-theme on the <html> element.
const ThemeContext = createContext(null);

const THEME_KEY = 'aw_theme';

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    // Apply the theme to the document so every CSS variable updates at once,
    // and remember the choice across reloads.
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
};
