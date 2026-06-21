import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

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
                        {user?.image && (
                            <img
                                src={user.image}
                                alt={user.displayName || user.username}
                                className="navbar-avatar"
                            />
                        )}
                        <span className="navbar-user">{user?.displayName || user?.username}</span>
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
