import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { deleteOrder, getOrders, getRestaurants } from '../api/endpoints';
import { useTheme } from '../context/ThemeContext';

const STATUS_LABELS = {
  pending: 'Pending',
  cancelled: 'Cancelled',
  in_progress: 'In progress',
  delivered: 'Delivered',
};

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [restaurantsById, setRestaurantsById] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [orderList, restaurants] = await Promise.all([getOrders(), getRestaurants()]);
      const byId = {};
      if (Array.isArray(restaurants)) {
        restaurants.forEach((restaurant) => { byId[restaurant.id] = restaurant; });
      }
      setRestaurantsById(byId);
      setOrders(Array.isArray(orderList) ? orderList : []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load your orders');
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async (order) => {
    setError('');
    setMessage('');
    setCancellingId(order.id);
    try {
      await deleteOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setMessage('Order cancelled.');
    } catch (err) {
      setError(err.message || 'Could not cancel this order');
    } finally {
      setCancellingId(null);
    }
  };

  const confirmCancel = (order) => {
    Alert.alert('Cancel order?', 'The restaurant will no longer receive this pending order.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => cancelOrder(order) },
    ]);
  };

  if (status === 'loading' && !orders.length) return <Loading message="Loading your orders" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="800">We couldn't load your orders</AppText>
        <AppText muted style={styles.centerText}>{error}</AppText>
        <Button title="Try again" onPress={load} style={styles.centerButton} />
      </View>
    );
  }

  const renderOrder = ({ item }) => {
    const restaurant = restaurantsById[item.restaurantId];
    const itemCount = item.items?.length || 0;
    const canCancel = item.status === 'pending';
    const isCancelling = cancellingId === item.id;

    return (
      <Pressable
        onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <AppText weight="800">{restaurant?.name || 'Restaurant'}</AppText>
              <AppText variant="small" muted>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </AppText>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'cancelled' ? theme.dangerSoft : theme.brandSoft },
            ]}
            >
              <AppText
                variant="small"
                weight="800"
                color={item.status === 'cancelled' ? theme.danger : theme.brand}
              >
                {STATUS_LABELS[item.status] || item.status}
              </AppText>
            </View>
          </View>

          <AppText variant="small" muted numberOfLines={1}>Order #{item.id}</AppText>
        </View>

        {canCancel ? (
          <Button
            title={isCancelling ? 'Cancelling...' : 'Cancel'}
            variant="secondary"
            onPress={() => confirmCancel(item)}
            loading={isCancelling}
            disabled={Boolean(cancellingId)}
            style={styles.cancelButton}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={load} tintColor={theme.brand} />}
        ListHeaderComponent={(
          <View style={styles.header}>
            <AppText variant="title" weight="800">Your orders</AppText>
            <AppText muted>Track recent orders and cancel pending ones.</AppText>
            {message ? (
              <View style={[styles.banner, { borderColor: theme.success }]}>
                <AppText color={theme.success} weight="700">{message}</AppText>
              </View>
            ) : null}
            {error ? (
              <View style={[styles.banner, { borderColor: theme.danger, backgroundColor: theme.dangerSoft }]}>
                <AppText color={theme.danger} weight="700">{error}</AppText>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <AppText variant="subtitle" weight="800">No orders yet</AppText>
            <AppText muted style={styles.emptyText}>When you check out, your order history will show here.</AppText>
            <Button title="Browse restaurants" onPress={() => navigation.navigate('Home')} style={styles.emptyButton} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 12 },
  header: { gap: 6, marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  pressed: { opacity: 0.82 },
  cardMain: { gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardTitle: { flex: 1, gap: 3 },
  statusBadge: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  cancelButton: { alignSelf: 'flex-start', minWidth: 120, height: 42 },
  banner: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { textAlign: 'center', marginTop: 8 },
  centerButton: { alignSelf: 'stretch', marginTop: 16 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { textAlign: 'center' },
  emptyButton: { alignSelf: 'stretch', marginTop: 8 },
});

export default OrdersScreen;
