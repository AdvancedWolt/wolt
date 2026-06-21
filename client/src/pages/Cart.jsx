import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createOrder, getRecommendations } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartLine from '../components/CartLine.jsx';
import '../styles/cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { restaurant, items, count, total, addItem, decrementItem, removeItem, clearCart } = useCart();

    const [recommendations, setRecommendations] = useState([]);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    // Suggestions come from the server's recommender, seeded with a dish already
    // in the cart. Best-effort: hide the section if it is unavailable.
    const anchorId = items[0]?.product.id;
    useEffect(() => {
        if (!isAuthenticated || !anchorId) {
            setRecommendations([]);
            return;
        }
        let active = true;
        getRecommendations(user.id, anchorId)
            .then((data) => { if (active) setRecommendations(data.recommendations || []); })
            .catch(() => { if (active) setRecommendations([]); });
        return () => { active = false; };
    }, [isAuthenticated, user?.id, anchorId]);

    const placeOrder = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        setError('');
        setPlacing(true);
        try {
            const productIds = items.flatMap((line) => Array(line.quantity).fill(line.product.id));
            await createOrder(restaurant.id, productIds);
            clearCart();
            navigate('/orders');
        } catch (err) {
            setError(err.message || 'Could not place your order');
        } finally {
            setPlacing(false);
        }
    };

    if (!items.length) {
        return (
            <section className="cart-empty">
                <span aria-hidden="true">🛒</span>
                <h1>Your cart is empty</h1>
                <p>Browse a restaurant and add a few dishes to get started.</p>
                <Link className="btn" to="/">Find restaurants</Link>
            </section>
        );
    }

    return (
        <div className="cart-page">
            <Link className="cart-back" to={`/restaurant/${restaurant?.id}`}>← Back to menu</Link>

            <header className="cart-header">
                <p className="cart-eyebrow">Your order from</p>
                <h1>{restaurant?.name}</h1>
            </header>

            {error && <div className="cart-error" role="alert">{error}</div>}

            <ul className="cart-lines">
                {items.map((line) => (
                    <CartLine
                        key={line.product.id}
                        line={line}
                        onIncrement={(product) => addItem(product, restaurant)}
                        onDecrement={decrementItem}
                        onRemove={removeItem}
                    />
                ))}
            </ul>

            {recommendations.length > 0 && (
                <section className="cart-recommendations" aria-labelledby="cart-recs">
                    <h2 id="cart-recs">You might also like</h2>
                    <div className="cart-recommendation-list">
                        {recommendations.map((product) => (
                            <Link key={product.id} className="cart-recommendation" to={`/restaurant/${product.restaurantId}`}>
                                <span className="cart-recommendation-media" aria-hidden="true">
                                    {product.image ? <img src={product.image} alt="" /> : product.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="cart-recommendation-name">{product.name}</span>
                                <span className="cart-recommendation-price">₪{Number(product.price ?? 0).toFixed(2)}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <footer className="cart-summary">
                <div className="cart-summary-row">
                    <span>{count} {count === 1 ? 'item' : 'items'}</span>
                    <strong>₪{total.toFixed(2)}</strong>
                </div>
                <div className="cart-summary-actions">
                    <button className="btn btn-secondary" type="button" onClick={clearCart} disabled={placing}>
                        Clear cart
                    </button>
                    <button className="btn" type="button" onClick={placeOrder} disabled={placing}>
                        {placing ? 'Placing order…' : isAuthenticated ? 'Place order' : 'Log in to order'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Cart;
