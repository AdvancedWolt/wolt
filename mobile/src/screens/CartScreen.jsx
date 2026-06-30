import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import { createOrder, getProducts, getRecommendations } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/format';

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const {
    restaurant,
    items,
    count,
    total,
    addItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // "You might also like": other dishes from this restaurant (so they can be
  // added to the same order), ordered by the C++ recommender when signed in.
  // Mirrors the web Cart page.
  const restaurantId = restaurant?.id;
  const anchorId = items[0]?.product.id;
  const inCartIds = items.map((line) => line.product.id).join(',');
  useEffect(() => {
    if (!restaurantId || !inCartIds) {
      setSuggestions([]);
      return undefined;
    }
    let active = true;
    const inCart = new Set(inCartIds.split(','));

    (async () => {
      let menu = [];
      try {
        menu = await getProducts(restaurantId);
      } catch {
        menu = [];
      }
      const candidates = (Array.isArray(menu) ? menu : []).filter((product) => !inCart.has(product.id));

      if (isAuthenticated && anchorId && user?.id) {
        try {
          const data = await getRecommendations(user.id, anchorId);
          const recommended = new Set((data.recommendations || []).map((product) => product.id));
          candidates.sort((left, right) => Number(recommended.has(right.id)) - Number(recommended.has(left.id)));
        } catch {
          // ranking is best-effort; fall back to the unranked menu order
        }
      }
      if (active) setSuggestions(candidates.slice(0, 6));
    })();

    return () => { active = false; };
  }, [restaurantId, inCartIds, isAuthenticated, user?.id, anchorId]);

  const checkout = async () => {
    if (!isAuthenticated) {
      const params = { redirectTo: { screen: 'Cart' } };
      const rootNavigation = navigation.getParent();
      if (rootNavigation) rootNavigation.navigate('Login', params);
      else navigation.navigate('Login', params);
      return;
    }

    if (!restaurant || !items.length) return;

    setError('');
    setConfirmation('');
    setPlacing(true);
    try {
      const productIds = items.flatMap((line) => Array(line.quantity).fill(line.product.id));
      await createOrder(restaurant.id, productIds);
      clearCart();
      setConfirmation('Order placed. The restaurant received it.');
    } catch (err) {
      setError(err.message || 'Could not place your order');
    } finally {
      setPlacing(false);
    }
  };

  const confirmClear = () => {
    Alert.alert('Clear cart?', 'This removes every item from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (!items.length) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="title" weight="800">Your cart is empty</AppText>
        <AppText muted style={styles.centerText}>
          Browse a restaurant and add a few dishes to get started.
        </AppText>
        {confirmation ? (
          <View style={[styles.success, { borderColor: theme.success }]}>
            <AppText color={theme.success} weight="700">{confirmation}</AppText>
          </View>
        ) : null}
        <Button title="Find restaurants" onPress={() => navigation.navigate('Home')} style={styles.centerButton} />
      </View>
    );
  }

  const renderLine = ({ item }) => (
    <View style={[styles.line, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {item.product.image ? (
        <Image source={{ uri: item.product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageFallback, { backgroundColor: theme.surface }]}>
          <AppText variant="subtitle">🍽️</AppText>
        </View>
      )}

      <View style={styles.lineBody}>
        <View style={styles.lineHeader}>
          <AppText weight="800" style={styles.lineName}>{item.product.name}</AppText>
          <AppText weight="800">{formatPrice(Number(item.product.price || 0) * item.quantity)}</AppText>
        </View>
        <AppText variant="small" muted>
          {formatPrice(item.product.price)} each
        </AppText>

        <View style={styles.lineActions}>
          <View style={[styles.stepper, { borderColor: theme.border }]}>
            <Pressable
              onPress={() => decrementItem(item.product.id)}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <AppText weight="800" color={theme.brand}>-</AppText>
            </Pressable>
            <AppText weight="800" style={styles.quantity}>{item.quantity}</AppText>
            <Pressable
              onPress={() => addItem(item.product, restaurant)}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <AppText weight="800" color={theme.brand}>+</AppText>
            </Pressable>
          </View>

          <Pressable
            onPress={() => removeItem(item.product.id)}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          >
            <AppText variant="small" weight="700" color={theme.danger}>Remove</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderLine}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View style={styles.header}>
            <AppText variant="small" muted>Your order from</AppText>
            <AppText variant="title" weight="800">{restaurant?.name || 'Restaurant'}</AppText>
            {error ? (
              <View style={[styles.banner, { borderColor: theme.danger, backgroundColor: theme.dangerSoft }]}>
                <AppText color={theme.danger} weight="700">{error}</AppText>
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={(
          <View>
            {suggestions.length ? (
              <View style={styles.recs}>
                <AppText variant="subtitle" weight="800" style={styles.recsTitle}>You might also like</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recsList}>
                  {suggestions.map((product) => (
                    <View key={product.id} style={[styles.recCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      {product.image ? (
                        <Image source={{ uri: product.image }} style={styles.recImage} />
                      ) : (
                        <View style={[styles.recImage, styles.imageFallback, { backgroundColor: theme.surface }]}>
                          <AppText variant="subtitle">🍽️</AppText>
                        </View>
                      )}
                      <View style={styles.recBody}>
                        <AppText weight="700" numberOfLines={1}>{product.name}</AppText>
                        <AppText variant="small" muted>{formatPrice(product.price)}</AppText>
                      </View>
                      <Pressable
                        onPress={() => addItem(product, restaurant)}
                        style={({ pressed }) => [styles.recAdd, { backgroundColor: theme.brandSoft }, pressed && styles.pressed]}
                      >
                        <AppText variant="small" weight="800" color={theme.brand}>+ Add</AppText>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <View style={{ height: 138 }} />
          </View>
        )}
      />

      <View style={[styles.summary, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <AppText muted>{count} {count === 1 ? 'item' : 'items'}</AppText>
          <AppText variant="subtitle" weight="800">{formatPrice(total)}</AppText>
        </View>
        <View style={styles.summaryActions}>
          <Button title="Clear" variant="secondary" onPress={confirmClear} disabled={placing} style={styles.clearButton} />
          <Button title={placing ? 'Placing order...' : 'Checkout'} onPress={checkout} loading={placing} style={styles.checkoutButton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 12 },
  header: { marginBottom: 4, gap: 4 },
  line: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  image: { width: 88, minHeight: 116 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  lineBody: { flex: 1, padding: 12, gap: 8 },
  lineHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  lineName: { flex: 1 },
  lineActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 'auto' },
  stepper: { height: 36, minWidth: 110, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10 },
  stepperButton: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 32, textAlign: 'center' },
  removeButton: { height: 36, justifyContent: 'center', paddingHorizontal: 8 },
  pressed: { opacity: 0.75 },
  banner: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12 },
  recs: { marginTop: 8 },
  recsTitle: { marginBottom: 10 },
  recsList: { gap: 12, paddingRight: 4 },
  recCard: { width: 150, borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  recImage: { width: '100%', height: 90 },
  recBody: { padding: 10, gap: 3 },
  recAdd: { margin: 10, marginTop: 0, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summary: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, padding: 16, gap: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryActions: { flexDirection: 'row', gap: 10 },
  clearButton: { flex: 0.34 },
  checkoutButton: { flex: 0.66 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { textAlign: 'center', marginTop: 8 },
  centerButton: { alignSelf: 'stretch', marginTop: 16 },
  success: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 16 },
});

export default CartScreen;
