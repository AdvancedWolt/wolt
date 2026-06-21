import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const query = searchParams.get('q') || '';
    const [searchValue, setSearchValue] = useState(query);

    useEffect(() => {
        setSearchValue(query);
    }, [query]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        if (val.trim()) {
            navigate(`/search?q=${encodeURIComponent(val)}`);
        } else {
            navigate('/search');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">AdvancedWolt</Link>

            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/cart">Cart{count > 0 && <span className="navbar-cart-count">{count}</span>}</Link>
                <Link to="/orders">Orders</Link>
                {user?.role === 'restaurant_owner' && <Link to="/manage">Manage</Link>}
            </div>

            <div className="navbar-search-wrapper">
                <input
                    type="search"
                    className="navbar-search-input"
                    placeholder="Search restaurants or dishes..."
                    value={searchValue}
                    onChange={handleSearchChange}
                />
                <span className="navbar-search-icon">🔍</span>
            </div>

            <div className="navbar-actions">
                {isAuthenticated ? (
                    <>
                        <div className="navbar-user-profile">
                            {user?.image && (
                                <img
                                    src={user.image}
                                    alt={user.displayName || user.username}
                                    className="navbar-avatar"
                                />
                            )}
                            <span className="navbar-user">Hello, {user?.displayName || user?.username}.</span>
                        </div>
                        <Link className="btn btn-secondary" to="/manage-account">
                            Manage account
                        </Link>
                        <button className="btn" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <Link className="btn" to="/login">Log in</Link>
                )}

                <ThemeToggle />
            </div>
        </nav>
    );
};

export default Navbar;
