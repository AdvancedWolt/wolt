import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = ({ className = 'btn btn-secondary' }) => {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    // The label shows the current theme so the emoji always matches what you see.
    return (
        <button
            type="button"
            className={className}
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        >
            {isLight ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
};

export default ThemeToggle;
