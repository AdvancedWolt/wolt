import { Link } from 'react-router-dom';

import Thumbnail from './Thumbnail.jsx';

const RestaurantCard = ({ restaurant }) => (
    <Link
        className="restaurant-card"
        to={`/restaurant/${restaurant.id}`}
        aria-label={`Open ${restaurant.name}`}
    >
        <div className="restaurant-card-media">
            <Thumbnail
                src={restaurant.image}
                name={restaurant.name}
                fallbackClassName="restaurant-card-fallback"
                lazy
            />
            {restaurant.promoted && <span className="restaurant-card-badge">Promoted</span>}
        </div>
        <div className="restaurant-card-body">
            <h3>{restaurant.name}</h3>
            <p>{restaurant.category || 'Other'}</p>
            {restaurant.location && (
                <small>{restaurant.location.x}, {restaurant.location.y}</small>
            )}
            {Number.isFinite(restaurant.distanceKm) && (
                <span className="restaurant-distance">{restaurant.distanceKm.toFixed(1)} km away</span>
            )}
        </div>
    </Link>
);

export default RestaurantCard;
