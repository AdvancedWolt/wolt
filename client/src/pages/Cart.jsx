import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createOrder, getProducts, getRecommendations } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartLine from '../components/CartLine.jsx';
import { formatPrice } from '../utils/format.js';
import '../styles/cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { restaurant, items, count, total, addItem, decrementItem, removeItem, clearCart } = useCart();

    const [suggestions, setSuggestions] = useState([]);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    // "You might also like": other dishes from this restaurant (so they can be
    // added to the same order), ordered by the recommender when signed in.
    const restaurantId = restaurant?.id;
    const anchorId = items[0]?.product.id;
    const inCartIds = items.map((line) => line.product.id).join(',');
    useEffect(() => {
        if (!restaurantId || !inCartIds) {
            setSuggestions([]);
            return;
        }
        let active = true;
        const inCart = new Set(inCartIds.split(','));

        (async () => {
            let menu = [];
            try {
                menu = await getProducts(restaurantId);
            } catch {
                menu = [];
            }
            const candidates = (Array.isArray(menu) ? menu : []).filter((p) => !inCart.has(p.id));

            if (isAuthenticated && anchorId) {
                try {
                    const data = await getRecommendations(user.id, anchorId);
                    const recommended = new Set((data.recommendations || []).map((p) => p.id));
                    candidates.sort((a, b) => Number(recommended.has(b.id)) - Number(recommended.has(a.id)));
                } catch {
                    // ranking is best-effort
                }
            }
            if (active) setSuggestions(candidates.slice(0, 6));
        })();

        return () => { active = false; };
    }, [restaurantId, inCartIds, isAuthenticated, user?.id, anchorId]);

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

            {suggestions.length > 0 && (
                <section className="cart-recommendations" aria-labelledby="cart-recs">
                    <h2 id="cart-recs">You might also like</h2>
                    <div className="cart-recommendation-list">
                        {suggestions.map((product) => (
                            <div key={product.id} className="cart-recommendation">
                                <span className="cart-recommendation-media" aria-hidden="true">
                                    {product.image ? <img src={product.image} alt="" /> : product.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="cart-recommendation-name">{product.name}</span>
                                <span className="cart-recommendation-price">{formatPrice(product.price)}</span>
                                <button className="cart-recommendation-add" type="button" onClick={() => addItem(product, restaurant)}>
                                    + Add
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <footer className="cart-summary">
                <div className="cart-summary-row">
                    <span>{count} {count === 1 ? 'item' : 'items'}</span>
                    <strong>{formatPrice(total)}</strong>
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
