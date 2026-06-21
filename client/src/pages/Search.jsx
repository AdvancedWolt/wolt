import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { search, getRestaurants } from '../api/endpoints.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import '../styles/search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState({ restaurants: [], products: [] });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [restaurantsMap, setRestaurantsMap] = useState({});

    // Load all restaurants to map restaurantId to restaurantName for dish cards
    useEffect(() => {
        getRestaurants()
            .then((data) => {
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach((r) => {
                        map[r.id] = r.name;
                    });
                    setRestaurantsMap(map);
                }
            })
            .catch(() => {});
    }, []);

    // Perform search whenever the URL query parameter changes
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults({ restaurants: [], products: [] });
            setStatus('idle');
            return;
        }

        let active = true;
        setStatus('loading');
        setError('');

        search(trimmed)
            .then((data) => {
                if (!active) return;
                setResults(data || { restaurants: [], products: [] });
                setStatus('ready');
            })
            .catch((err) => {
                if (!active) return;
                setError(err.message || 'Something went wrong during search.');
                setStatus('error');
            });

        return () => {
            active = false;
        };
    }, [query]);

    const hasRestaurants = results.restaurants.length > 0;
    const hasProducts = results.products.length > 0;
    const hasResults = hasRestaurants || hasProducts;

    return (
        <div className="search-page">
            <header className="search-header">
                <p className="search-subtitle">Search</p>
                <h1>{query ? `Results for “${query}”` : 'Find restaurants & dishes'}</h1>
            </header>

            {status === 'idle' && (
                <section className="search-state search-state-idle" aria-live="polite">
                    <span className="search-state-icon" aria-hidden="true">🔍</span>
                    <h2>Search restaurants and dishes</h2>
                    <p>Use the search bar at the top to find a place or a dish you&apos;re craving.</p>
                </section>
            )}

            {status === 'loading' && (
                <section className="search-state" role="status" aria-live="polite">
                    <div className="search-spinner" />
                    <h2>Searching our menu</h2>
                    <p>Looking up matches for your query...</p>
                </section>
            )}

            {status === 'error' && (
                <section className="search-state search-state-error" role="alert" aria-live="assertive">
                    <span className="search-state-icon" aria-hidden="true">!</span>
                    <h2>Search Failed</h2>
                    <p>{error}</p>
                </section>
            )}

            {status === 'ready' && !hasResults && (
                <section className="search-state search-state-empty" aria-live="polite">
                    <span className="search-state-icon" aria-hidden="true">🍽️</span>
                    <h2>We couldn&apos;t find any matches</h2>
                    <p>
                        We checked our list of restaurants and dishes, but nothing matched &ldquo;{query}&rdquo;.
                        <br />
                        Try checking your spelling or search for something else.
                    </p>
                </section>
            )}

            {status === 'ready' && hasResults && (
                <div className="search-results">
                    {hasRestaurants && (
                        <section className="search-section" aria-labelledby="restaurants-results-heading">
                            <h2 id="restaurants-results-heading" className="search-section-title">
                                Restaurants ({results.restaurants.length})
                            </h2>
                            <div className="search-restaurants-grid">
                                {results.restaurants.map((restaurant) => (
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                ))}
                            </div>
                        </section>
                    )}

                    {hasProducts && (
                        <section className="search-section" aria-labelledby="products-results-heading">
                            <h2 id="products-results-heading" className="search-section-title">
                                Dishes &amp; Items ({results.products.length})
                            </h2>
                            <div className="search-dishes-grid">
                                {results.products.map((product) => (
                                    <DishResultCard
                                        key={product.id}
                                        product={product}
                                        restaurantName={restaurantsMap[product.restaurantId]}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

const DishResultCard = ({ product, restaurantName }) => {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <article className="search-dish-card">
            <div className="search-dish-media" aria-hidden="true">
                {product.image && !imageFailed ? (
                    <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <span className="search-dish-fallback">
                        {product.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="search-dish-body">
                <header className="search-dish-header">
                    <h3>{product.name}</h3>
                    <span className="search-dish-price">₪{Number(product.price ?? 0).toFixed(2)}</span>
                </header>
                <p className="search-dish-desc">{product.description || 'No description provided'}</p>
                {restaurantName && (
                    <footer className="search-dish-footer">
                        <Link
                            to={`/restaurant/${product.restaurantId}`}
                            className="search-dish-restaurant-link"
                        >
                            Order from <strong>{restaurantName}</strong> &rarr;
                        </Link>
                    </footer>
                )}
            </div>
        </article>
    );
};

export default Search;
