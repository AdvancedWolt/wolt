import { useState } from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = restaurant.image && !imageFailed;

    return (
        <Link
            className="restaurant-card"
            to={`/restaurant/${restaurant.id}`}
            aria-label={`Open ${restaurant.name}`}
        >
            <div className="restaurant-card-media">
                {showImage ? (
                    <img
                        src={restaurant.image}
                        alt=""
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <span className="restaurant-card-fallback" aria-hidden="true">
                        {restaurant.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
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
};

export default RestaurantCard;
