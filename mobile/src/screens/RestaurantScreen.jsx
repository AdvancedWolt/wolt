import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

import Thumbnail from '../components/Thumbnail';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import MenuItem from '../components/MenuItem';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { getProduct, getProducts, getRestaurant } from '../api/endpoints';

// A restaurant's page: header plus its menu. Adding a dish from a different
// restaurant than the current cart asks before clearing it, matching the web.
const RestaurantScreen = ({ route, navigation }) => {
  const { id, name } = route.params;
  const { theme } = useTheme();
  const { addItem, quantityFor, restaurant: cartRestaurant, count } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [pendingProduct, setPendingProduct] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: name || 'Restaurant' });
  }, [navigation, name]);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [restaurantData, productData] = await Promise.all([getRestaurant(id), getProducts(id)]);
      if (!Array.isArray(productData)) throw new Error('The menu is unavailable');
      setRestaurant(restaurantData);
      setProducts(productData);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load this restaurant');
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const addToCart = (product) => {
    addItem(product, { id: restaurant.id, name: restaurant.name });
    // Record interest so the recommender can suggest similar dishes in the cart.
    getProduct(restaurant.id, product.id).catch(() => {});
  };

  const handleAdd = (product) => {
    if (cartRestaurant && cartRestaurant.id !== id && count > 0) {
      setPendingProduct(product);
      return;
    }
    addToCart(product);
  };

  const confirmNewCart = () => {
    addToCart(pendingProduct);
    setPendingProduct(null);
  };

  if (status === 'loading') return <Loading message="Loading the menu" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="700">Menu unavailable</AppText>
        <AppText muted style={styles.errorText}>{error}</AppText>
        <Button title="Try again" onPress={load} style={styles.retry} />
      </View>
    );
  }

  const cartCount = cartRestaurant?.id === id ? count : 0;

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItem product={item} quantity={quantityFor(id, item.id)} onAdd={handleAdd} />
        )}
        contentContainerStyle={[styles.content, cartCount > 0 && styles.contentWithBar]}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Thumbnail src={restaurant.image} name={restaurant.name} style={styles.hero} />
            <AppText variant="small" muted style={styles.category}>{restaurant.category || 'Other'}</AppText>
            <AppText variant="title" weight="800">{restaurant.name}</AppText>
            <AppText muted style={styles.dishCount}>
              {products.length} {products.length === 1 ? 'dish' : 'dishes'} on the menu
            </AppText>
            <AppText variant="subtitle" weight="800" style={styles.menuHeading}>Menu</AppText>
          </View>
        )}
        ListEmptyComponent={(
          <AppText muted style={styles.empty}>This restaurant hasn&apos;t added any dishes yet.</AppText>
        )}
      />

      {cartCount > 0 && (
        <View style={[styles.bar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <AppText weight="700">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</AppText>
          <Button title="View cart" onPress={() => navigation.navigate('Main', { screen: 'Cart' })} style={styles.barButton} />
        </View>
      )}

      <ConfirmDialog
        open={Boolean(pendingProduct)}
        title="Start a new cart?"
        message={`Your cart has items from ${cartRestaurant?.name}. Adding a dish from ${restaurant.name} will clear it.`}
        confirmLabel="Start new cart"
        cancelLabel="Keep current"
        onConfirm={confirmNewCart}
        onCancel={() => setPendingProduct(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16 },
  contentWithBar: { paddingBottom: 96 },
  header: { marginBottom: 4 },
  hero: { width: '100%', height: 180, borderRadius: 16, marginBottom: 14 },
  category: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  dishCount: { marginTop: 2 },
  menuHeading: { marginTop: 18 },
  empty: { textAlign: 'center', marginTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { marginVertical: 8, textAlign: 'center' },
  retry: { alignSelf: 'stretch', marginTop: 8 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  barButton: { paddingHorizontal: 24 },
});

export default RestaurantScreen;
