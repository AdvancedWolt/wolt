import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { deleteOrder, getOrder, getProducts, getRestaurant, updateOrder } from '../api/endpoints.js';
import { formatPrice } from '../utils/format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import '../styles/orders.css';

const STATUS_LABELS = {
    pending: 'Placed',
    cancelled: 'Cancelled',
    'in-progress': 'In progress',
    delivered: 'Delivered',
};

// Turns an order's flat list of product ids (one per unit) into priced lines.
const toLines = (items, products) => {
    const productsById = {};
    products.forEach((product) => { productsById[product.id] = product; });

    const counts = new Map();
    (items || []).forEach((productId) => counts.set(productId, (counts.get(productId) || 0) + 1));

    return [...counts.entries()].map(([productId, quantity]) => ({
        product: productsById[productId] || { id: productId, name: 'Item no longer available', price: 0 },
        quantity,
    }));
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [lines, setLines] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(async () => {
        setStatus('loading');
        setError('');
        try {
            const fetched = await getOrder(id);
            // The restaurant and its menu may have been removed; the order still stands.
            const [restaurantData, products] = await Promise.all([
                getRestaurant(fetched.restaurantId).catch(() => null),
                getProducts(fetched.restaurantId).catch(() => []),
            ]);
            setOrder(fetched);
            setRestaurant(restaurantData);
            setLines(toLines(fetched.items, Array.isArray(products) ? products : []));
            setStatus('ready');
        } catch (err) {
            setError(err.message || 'Could not load this order');
            setStatus('error');
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const cancel = async () => {
        setConfirm(null);
        setBusy(true);
        setError('');
        try {
            await updateOrder(id, { status: 'cancelled' });
            await load();
        } catch (err) {
            setError(err.message || 'Could not cancel the order');
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        setConfirm(null);
        setBusy(true);
        setError('');
        try {
            await deleteOrder(id);
            navigate('/orders');
        } catch (err) {
            setError(err.message || 'Could not remove the order');
            setBusy(false);
        }
    };

    if (status === 'loading') {
        return (
            <section className="orders-state" role="status">
                <div className="feed-spinner" />
                <h1>Loading your order</h1>
            </section>
        );
    }

    if (status === 'error') {
        return (
            <section className="orders-state" role="alert">
                <h1>We couldn&apos;t load this order</h1>
                <p>{error}</p>
                <Link className="btn" to="/orders">Back to your orders</Link>
            </section>
        );
    }

    const total = lines.reduce((sum, line) => sum + Number(line.product.price || 0) * line.quantity, 0);

    return (
        <div className="order-detail-page">
            <Link className="order-detail-back" to="/orders">← Your orders</Link>

            <header className="order-detail-header">
                <div>
                    <p className="order-detail-eyebrow">Order from</p>
                    <h1>{restaurant?.name || 'Restaurant'}</h1>
                </div>
                <span className={`order-status order-status-${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                </span>
            </header>

            {error && <div className="orders-error" role="alert">{error}</div>}

            {lines.length ? (
                <ul className="order-detail-lines">
                    {lines.map((line) => (
                        <li key={line.product.id} className="order-detail-line">
                            <span className="order-detail-qty">{line.quantity}×</span>
                            <span className="order-detail-name">{line.product.name}</span>
                            <span className="order-detail-price">
                                {formatPrice(Number(line.product.price || 0) * line.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="order-detail-empty">This order has no items.</p>
            )}

            <footer className="order-detail-summary">
                <div className="order-detail-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                </div>

                {order.status === 'pending' && (
                    <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirm({
                            title: 'Cancel order?',
                            message: 'This cancels your order. It stays in your history as cancelled.',
                            confirmLabel: 'Cancel order',
                            cancelLabel: 'Keep order',
                            onConfirm: cancel,
                        })}
                    >
                        Cancel order
                    </button>
                )}

                {order.status === 'cancelled' && (
                    <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirm({
                            title: 'Remove order?',
                            message: 'This permanently removes the order from your history.',
                            confirmLabel: 'Remove order',
                            cancelLabel: 'Keep',
                            onConfirm: remove,
                        })}
                    >
                        Remove from history
                    </button>
                )}
            </footer>

            <ConfirmDialog
                open={Boolean(confirm)}
                title={confirm?.title}
                message={confirm?.message}
                confirmLabel={confirm?.confirmLabel}
                cancelLabel={confirm?.cancelLabel}
                onConfirm={confirm?.onConfirm}
                onCancel={() => setConfirm(null)}
            />
        </div>
    );
};

export default OrderDetail;
