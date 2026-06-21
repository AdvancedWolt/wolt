import { Link } from 'react-router-dom';

import Thumbnail from './Thumbnail.jsx';
import { formatPrice } from '../utils/format.js';

const DishResultCard = ({ product, restaurantName }) => (
    <article className="search-dish-card">
        <div className="search-dish-media" aria-hidden="true">
            <Thumbnail
                src={product.image}
                name={product.name}
                fallbackClassName="search-dish-fallback"
                lazy
            />
        </div>
        <div className="search-dish-body">
            <header className="search-dish-header">
                <h3>{product.name}</h3>
                <span className="search-dish-price">{formatPrice(product.price)}</span>
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

export default DishResultCard;
