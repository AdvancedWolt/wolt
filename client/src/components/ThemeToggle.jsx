import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = ({ className = 'btn btn-secondary' }) => {
    const { theme, toggleTheme } = useTheme();
    const goingDark = theme === 'light';

    return (
        <button
            type="button"
            className={className}
            onClick={toggleTheme}
            aria-label={`Switch to ${goingDark ? 'dark' : 'light'} mode`}
        >
            {goingDark ? '🌙 Dark' : '☀️ Light'}
        </button>
    );
};

export default ThemeToggle;
