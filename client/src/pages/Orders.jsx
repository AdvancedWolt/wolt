import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getOrders, getRestaurants } from '../api/endpoints.js';
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
                <p>Tap an order to see its dishes, cancel it or remove it.</p>
            </header>

            {orders.length ? (
                <ul className="orders-list">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            restaurant={restaurantsById[order.restaurantId]}
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
