import RestaurantCard from './RestaurantCard.jsx';

const RestaurantRow = ({ title, restaurants }) => (
    <section className="restaurant-row" aria-labelledby={`row-${title}`}>
        <div className="restaurant-row-heading">
            <h2 id={`row-${title}`}>{title}</h2>
            <span>{restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}</span>
        </div>
        <div className="restaurant-row-scroll">
            {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    </section>
);

export default RestaurantRow;
