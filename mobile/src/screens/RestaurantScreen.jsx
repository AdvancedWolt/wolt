import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { getProduct, getProducts, getRestaurant } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/format';

const RestaurantScreen = ({ navigation, route }) => {
  const { id, name } = route.params || {};
  const { theme } = useTheme();
  const {
    addItem,
    decrementItem,
    quantityFor,
    restaurant: cartRestaurant,
    count,
  } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) {
      setError('Restaurant not found');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      const [restaurantData, productData] = await Promise.all([
        getRestaurant(id),
        getProducts(id),
      ]);
      if (!Array.isArray(productData)) throw new Error('The menu is unavailable');
      setRestaurant(restaurantData);
      setProducts(productData);
      setStatus('ready');
      navigation.setOptions({ title: restaurantData?.name || name || 'Restaurant' });
    } catch (err) {
      setError(err.message || 'Could not load this restaurant');
      setStatus('error');
    }
  }, [id, name, navigation]);

  useEffect(() => { load(); }, [load]);

  const activeRestaurant = restaurant || { id, name: name || 'Restaurant' };
  const cartCount = cartRestaurant?.id === id ? count : 0;

  const handleAdd = (product) => {
    addItem(product, { id: activeRestaurant.id, name: activeRestaurant.name });
    getProduct(activeRestaurant.id, product.id).catch(() => {});
  };

  if (status === 'loading' && !restaurant) return <Loading message="Loading the menu" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="800">Menu unavailable</AppText>
        <AppText muted style={styles.centerText}>{error}</AppText>
        <Button title="Try again" onPress={load} style={styles.centerButton} />
      </View>
    );
  }

  const renderProduct = ({ item }) => {
    const quantity = quantityFor(id, item.id);

    return (
      <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.imageFallback, { backgroundColor: theme.surface }]}>
            <AppText variant="subtitle">🍽️</AppText>
          </View>
        )}

        <View style={styles.productBody}>
          <View style={styles.productHeader}>
            <AppText weight="800" style={styles.productName}>{item.name}</AppText>
            <AppText weight="800">{formatPrice(item.price)}</AppText>
          </View>
          {item.description ? <AppText variant="small" muted>{item.description}</AppText> : null}

          <View style={styles.productActions}>
            {quantity > 0 ? (
              <View style={[styles.stepper, { borderColor: theme.border }]}>
                <Pressable
                  onPress={() => decrementItem(item.id)}
                  style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
                >
                  <AppText weight="800" color={theme.brand}>-</AppText>
                </Pressable>
                <AppText weight="800" style={styles.quantity}>{quantity}</AppText>
                <Pressable
                  onPress={() => handleAdd(item)}
                  style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
                >
                  <AppText weight="800" color={theme.brand}>+</AppText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => handleAdd(item)}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: theme.brandSoft },
                  pressed && styles.pressed,
                ]}
              >
                <AppText weight="800" color={theme.brand}>Add</AppText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={[styles.list, cartCount ? styles.listWithBar : null]}
        refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={load} tintColor={theme.brand} />}
        ListHeaderComponent={(
          <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {restaurant?.image ? (
              <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroImage, styles.imageFallback, { backgroundColor: theme.surface }]}>
                <AppText variant="title">🍽️</AppText>
              </View>
            )}
            <View style={styles.heroCopy}>
              <AppText variant="small" muted>{restaurant?.category || 'Other'}</AppText>
              <AppText variant="title" weight="800">{activeRestaurant.name}</AppText>
              <AppText muted>
                {products.length} {products.length === 1 ? 'dish' : 'dishes'} on the menu
              </AppText>
            </View>
          </View>
        )}
        ListEmptyComponent={<AppText muted style={styles.empty}>No dishes yet.</AppText>}
      />

      {cartCount > 0 ? (
        <View style={[styles.cartBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <View>
            <AppText weight="800">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</AppText>
            <AppText variant="small" muted>Ready when you are</AppText>
          </View>
          <Button title="View cart" onPress={() => navigation.navigate('Main', { screen: 'Cart' })} style={styles.cartButton} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 12 },
  listWithBar: { paddingBottom: 104 },
  hero: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 4 },
  heroImage: { width: '100%', height: 150 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  heroCopy: { padding: 14, gap: 4 },
  productCard: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  productImage: { width: 96, minHeight: 116 },
  productBody: { flex: 1, padding: 12, gap: 8 },
  productHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' },
  productName: { flex: 1 },
  productActions: { alignItems: 'flex-end', marginTop: 'auto' },
  addButton: { height: 36, minWidth: 76, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  stepper: { height: 36, minWidth: 110, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10 },
  stepperButton: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 32, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 88,
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cartButton: { minWidth: 132 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { textAlign: 'center', marginTop: 8 },
  centerButton: { alignSelf: 'stretch', marginTop: 16 },
  empty: { textAlign: 'center', marginTop: 36 },
});

export default RestaurantScreen;
