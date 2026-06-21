import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { cancelOrder, getOrders, getRestaurants } from '../api/endpoints.js';
import OrderCard from '../components/OrderCard.jsx';
import '../styles/orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [restaurantsById, setRestaurantsById] = useState({});
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setStatus('loading');
        setError('');
        try {
            // Orders only carry a restaurant id, so fetch the feed once to show names.
            const [orderList, restaurants] = await Promise.all([getOrders(), getRestaurants()]);
            const byId = {};
            restaurants.forEach((restaurant) => { byId[restaurant.id] = restaurant; });
            setRestaurantsById(byId);
            setOrders(orderList);
            setStatus('ready');
        } catch (err) {
            setError(err.message || 'Could not load your orders');
            setStatus('error');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCancel = async (orderId) => {
        setError('');
        try {
            await cancelOrder(orderId);
            load();
        } catch (err) {
            setError(err.message || 'Could not cancel the order');
        }
    };

    if (status === 'loading') {
        return (
            <section className="orders-state" role="status">
                <div className="feed-spinner" />
                <h1>Loading your orders</h1>
            </section>
        );
    }

    if (status === 'error') {
        return (
            <section className="orders-state" role="alert">
                <h1>We couldn&apos;t load your orders</h1>
                <p>{error}</p>
                <button className="btn" type="button" onClick={load}>Try again</button>
            </section>
        );
    }

    return (
        <div className="orders-page">
            <header className="orders-header">
                <h1>Your orders</h1>
                <p>Track current orders and revisit past ones.</p>
            </header>

            {error && <div className="orders-error" role="alert">{error}</div>}

            {orders.length ? (
                <ul className="orders-list">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            restaurant={restaurantsById[order.restaurantId]}
                            onCancel={handleCancel}
                        />
                    ))}
                </ul>
            ) : (
                <section className="orders-empty">
                    <span aria-hidden="true">🧾</span>
                    <h2>No orders yet</h2>
                    <p>When you place an order it will show up here.</p>
                    <Link className="btn" to="/">Browse restaurants</Link>
                </section>
            )}
        </div>
    );
};

export default Orders;
