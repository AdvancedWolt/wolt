import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRestaurants } from '../api/endpoints.js';
import RestaurantRow from '../components/RestaurantRow.jsx';
import '../styles/home.css';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    const loadRestaurants = useCallback(async () => {
        setStatus('loading');
        setError('');

        try {
            const data = await getRestaurants();
            if (!Array.isArray(data)) throw new Error('The restaurant feed is unavailable');
            setRestaurants(data);
            setStatus('ready');
        } catch (err) {
            setError(err.message || 'Could not load restaurants');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    const promoted = useMemo(() => {
        const explicitlyPromoted = restaurants.filter((restaurant) => restaurant.promoted);
        return explicitlyPromoted.length ? explicitlyPromoted : restaurants.slice(0, 5);
    }, [restaurants]);

    const categories = useMemo(() => {
        const grouped = restaurants.reduce((rows, restaurant) => {
            const category = restaurant.category?.trim() || 'Other';
            if (!rows.has(category)) rows.set(category, []);
            rows.get(category).push(restaurant);
            return rows;
        }, new Map());

        return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
    }, [restaurants]);

    if (status === 'loading') {
        return (
            <section className="feed-state" role="status">
                <div className="feed-spinner" />
                <h1>Finding restaurants near you</h1>
                <p>Loading the latest places from the server…</p>
            </section>
        );
    }

    if (status === 'error') {
        return (
            <section className="feed-state feed-state-error" role="alert">
                <span className="feed-state-icon">!</span>
                <h1>We couldn&apos;t load the feed</h1>
                <p>{error}</p>
                <button className="btn" type="button" onClick={loadRestaurants}>Try again</button>
            </section>
        );
    }

    if (!restaurants.length) {
        return (
            <section className="feed-state">
                <span className="feed-state-icon">⌁</span>
                <h1>No restaurants yet</h1>
                <p>New places will appear here as soon as they are added.</p>
            </section>
        );
    }

    return (
        <div className="home-feed">
            <header className="home-hero">
                <p className="home-eyebrow">Restaurants near you</p>
                <h1>What are you craving?</h1>
                <p>Explore promoted picks and browse every place by category.</p>
            </header>

            <RestaurantRow title="Promoted" restaurants={promoted} />

            {categories.map(([category, categoryRestaurants]) => (
                <RestaurantRow
                    key={category}
                    title={category}
                    restaurants={categoryRestaurants}
                />
            ))}
        </div>
    );
};

export default Home;
