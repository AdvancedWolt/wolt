import Placeholder from '../components/Placeholder';

// EX5-9 fills this in: restaurant header, menu list and add-to-cart.
const RestaurantScreen = ({ route }) => (
  <Placeholder title={route.params?.name || 'Restaurant'} ticket="EX5-9" note="Menu & add to cart" />
);

export default RestaurantScreen;
