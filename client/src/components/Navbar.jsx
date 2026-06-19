import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Minimal app shell so the skeleton is usable end to end. P2 (EX4-4) replaces
// this with the full Wolt-style top bar; the context wiring below (useAuth,
// useTheme, the logout flow) is the part worth keeping.
const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">AdvancedWolt</Link>

            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/search">Search</Link>
                <Link to="/orders">Orders</Link>
                <Link to="/manage">Manage</Link>
            </div>

            <div className="navbar-actions">
                <button className="btn" onClick={toggleTheme}>
                    {theme === 'light' ? 'Dark' : 'Light'} mode
                </button>

                {isAuthenticated ? (
                    <>
                        <span className="navbar-user">{user?.name || user?.username}</span>
                        <button className="btn" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <Link className="btn" to="/login">Log in</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
