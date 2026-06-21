import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getProducts, getRestaurant } from '../api/endpoints.js';
import MenuItem from '../components/MenuItem.jsx';
import { useCart } from '../context/CartContext.jsx';
import '../styles/restaurant-detail.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const { addItem, quantityFor, restaurant: cartRestaurant, count } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [imageFailed, setImageFailed] = useState(false);

    const loadMenu = useCallback(async () => {
        setStatus('loading');
        setError('');

        try {
            const [restaurantData, productData] = await Promise.all([
                getRestaurant(id),
                getProducts(id),
            ]);

            if (!Array.isArray(productData)) throw new Error('The menu is unavailable');
            setRestaurant(restaurantData);
            setProducts(productData);
            setStatus('ready');
        } catch (err) {
            setError(err.message || 'Could not load this restaurant');
            setStatus('error');
        }
    }, [id]);

    useEffect(() => {
        setImageFailed(false);
        loadMenu();
    }, [loadMenu]);

    const cartCount = cartRestaurant?.id === id ? count : 0;

    const handleAdd = (product) => {
        if (cartRestaurant && cartRestaurant.id !== id && count > 0) {
            const startNewCart = window.confirm(
                `Your cart has items from ${cartRestaurant.name}. Start a new cart with ${restaurant.name}?`
            );
            if (!startNewCart) return;
        }
        addItem(product, { id: restaurant.id, name: restaurant.name });
    };

    if (status === 'loading') {
        return (
            <section className="detail-state" role="status">
                <div className="feed-spinner" />
                <h1>Loading the menu</h1>
                <p>Fetching dishes from the restaurant…</p>
            </section>
        );
    }

    if (status === 'error') {
        return (
            <section className="detail-state" role="alert">
                <span className="detail-state-icon">!</span>
                <h1>Menu unavailable</h1>
                <p>{error}</p>
                <div className="detail-state-actions">
                    <button className="btn" type="button" onClick={loadMenu}>Try again</button>
                    <Link className="detail-link" to="/">Back to restaurants</Link>
                </div>
            </section>
        );
    }

    return (
        <div className="restaurant-detail">
            <Link className="detail-back" to="/">← All restaurants</Link>

            <header className="detail-hero">
                <div className="detail-hero-media">
                    {restaurant.image && !imageFailed ? (
                        <img
                            src={restaurant.image}
                            alt=""
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <span aria-hidden="true">{restaurant.name.slice(0, 1).toUpperCase()}</span>
                    )}
                </div>
                <div className="detail-hero-copy">
                    <p>{restaurant.category || 'Other'}</p>
                    <h1>{restaurant.name}</h1>
                    <span>{products.length} {products.length === 1 ? 'dish' : 'dishes'} on the menu</span>
                    {restaurant.location && (
                        <span className="detail-location">📍 {restaurant.location.x}, {restaurant.location.y}</span>
                    )}
                </div>
            </header>

            <section className="menu-section" aria-labelledby="menu-heading">
                <div className="menu-heading">
                    <div>
                        <p className="menu-eyebrow">Full menu</p>
                        <h2 id="menu-heading">Choose your dishes</h2>
                    </div>
                </div>

                {products.length ? (
                    <div className="menu-list">
                        {products.map((product) => (
                            <MenuItem
                                key={product.id}
                                product={product}
                                quantity={quantityFor(id, product.id)}
                                onAdd={handleAdd}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="menu-empty">
                        <span aria-hidden="true">⌁</span>
                        <h3>No dishes yet</h3>
                        <p>This restaurant hasn&apos;t added anything to its menu.</p>
                    </div>
                )}
            </section>

            {cartCount > 0 && (
                <aside className="selection-bar" aria-live="polite">
                    <div>
                        <strong>{cartCount}</strong>
                        <span>{cartCount === 1 ? ' item in cart' : ' items in cart'}</span>
                    </div>
                    <Link className="btn selection-checkout" to="/cart">View cart</Link>
                </aside>
            )}
        </div>
    );
};

export default RestaurantDetail;
