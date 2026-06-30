import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Screen from '../components/Screen';
import { deleteOrder, getOrder, getProducts, getRestaurant, updateOrder } from '../api/endpoints';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/format';

const STATUS_LABELS = {
  pending: 'Placed',
  cancelled: 'Cancelled',
  in_progress: 'In progress',
  'in-progress': 'In progress',
  delivered: 'Delivered',
};

// Collapse an order's flat list of product ids (one entry per unit) into priced
// lines with quantities, exactly like the web OrderDetail page.
const toLines = (items, products) => {
  const productsById = {};
  products.forEach((product) => { productsById[product.id] = product; });

  const counts = new Map();
  (items || []).forEach((productId) => counts.set(productId, (counts.get(productId) || 0) + 1));

  return [...counts.entries()].map(([productId, quantity]) => ({
    product: productsById[productId] || { id: productId, name: 'Item no longer available', price: 0 },
    quantity,
  }));
};

// Itemised order with cancel (pending → cancelled) and remove (deletes a
// cancelled order from history). Mirrors the web OrderDetail flow; reached from
// the Orders list via navigation.navigate('OrderDetail', { id }).
const OrderDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const { theme } = useTheme();

  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setError('Order not found');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const fetched = await getOrder(id);
      // The restaurant and its menu may have been removed; the order still stands.
      const [restaurantData, products] = await Promise.all([
        getRestaurant(fetched.restaurantId).catch(() => null),
        getProducts(fetched.restaurantId).catch(() => []),
      ]);
      setOrder(fetched);
      setRestaurant(restaurantData);
      setLines(toLines(fetched.items, Array.isArray(products) ? products : []));
      setStatus('ready');
      navigation.setOptions({ title: `Order #${fetched.id}` });
    } catch (err) {
      setError(err.message || 'Could not load this order');
      setStatus('error');
    }
  }, [id, navigation]);

  useEffect(() => { load(); }, [load]);

  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      await updateOrder(id, { status: 'cancelled' });
      await load();
    } catch (err) {
      setError(err.message || 'Could not cancel the order');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteOrder(id);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Could not remove the order');
      setBusy(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert('Cancel order?', 'This cancels your order. It stays in your history as cancelled.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: cancel },
    ]);
  };

  const confirmRemove = () => {
    Alert.alert('Remove order?', 'This permanently removes the order from your history.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove order', style: 'destructive', onPress: remove },
    ]);
  };

  if (status === 'loading' && !order) return <Loading message="Loading your order" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="800">We couldn&apos;t load this order</AppText>
        <AppText muted style={styles.centerText}>{error}</AppText>
        <Button title="Back to your orders" onPress={() => navigation.goBack()} style={styles.centerButton} />
      </View>
    );
  }

  const total = lines.reduce((sum, line) => sum + Number(line.product.price || 0) * line.quantity, 0);
  const isCancelled = order.status === 'cancelled';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="small" muted>Order from</AppText>
          <AppText variant="title" weight="800">{restaurant?.name || 'Restaurant'}</AppText>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isCancelled ? theme.dangerSoft : theme.brandSoft },
        ]}
        >
          <AppText variant="small" weight="800" color={isCancelled ? theme.danger : theme.brand}>
            {STATUS_LABELS[order.status] || order.status}
          </AppText>
        </View>
      </View>

      {error ? (
        <View style={[styles.banner, { borderColor: theme.danger, backgroundColor: theme.dangerSoft }]}>
          <AppText color={theme.danger} weight="700">{error}</AppText>
        </View>
      ) : null}

      {lines.length ? (
        <View style={[styles.lines, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {lines.map((line, index) => (
            <View
              key={line.product.id}
              style={[styles.line, index < lines.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
            >
              {line.product.image ? (
                <Image source={{ uri: line.product.image }} style={styles.lineImage} />
              ) : (
                <View style={[styles.lineImage, styles.lineImageEmpty, { backgroundColor: theme.surface }]}>
                  <AppText>🍽️</AppText>
                </View>
              )}
              <View style={styles.lineBody}>
                <AppText weight="700">{line.product.name}</AppText>
                <AppText variant="small" muted>
                  {line.quantity} × {formatPrice(line.product.price)}
                </AppText>
              </View>
              <AppText weight="800">{formatPrice(Number(line.product.price || 0) * line.quantity)}</AppText>
            </View>
          ))}
        </View>
      ) : (
        <AppText muted style={styles.empty}>This order has no items.</AppText>
      )}

      <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
        <AppText variant="subtitle" weight="700">Total</AppText>
        <AppText variant="subtitle" weight="800">{formatPrice(total)}</AppText>
      </View>

      {order.status === 'pending' ? (
        <Button
          title={busy ? 'Cancelling…' : 'Cancel order'}
          variant="secondary"
          onPress={confirmCancel}
          loading={busy}
          disabled={busy}
          style={styles.action}
        />
      ) : null}

      {isCancelled ? (
        <Button
          title={busy ? 'Removing…' : 'Remove from history'}
          variant="secondary"
          onPress={confirmRemove}
          loading={busy}
          disabled={busy}
          style={styles.action}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  headerCopy: { flex: 1, gap: 3 },
  statusBadge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  banner: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  lines: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  lineImage: { width: 52, height: 52, borderRadius: 10 },
  lineImageEmpty: { alignItems: 'center', justifyContent: 'center' },
  lineBody: { flex: 1, gap: 3 },
  empty: { textAlign: 'center', marginVertical: 24 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, marginTop: 16, paddingTop: 16 },
  action: { marginTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { textAlign: 'center', marginTop: 8 },
  centerButton: { alignSelf: 'stretch', marginTop: 16 },
});

export default OrderDetailScreen;
