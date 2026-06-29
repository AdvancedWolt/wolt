import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import RestaurantRow from '../components/RestaurantRow';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRestaurants } from '../api/endpoints';
import { distanceInKm } from '../utils/geo';

// The discovery feed: live restaurants grouped into "Near you", "Promoted" and
// per-category rows, ranked by distance from the signed-in user (same shape as
// the web home page). Tapping a card opens its menu.
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getRestaurants();
      if (!Array.isArray(data)) throw new Error('The restaurant feed is unavailable');
      setRestaurants(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load restaurants');
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const withDistance = useMemo(() => restaurants.map((restaurant) => ({
    ...restaurant,
    distanceKm: distanceInKm(user?.location, restaurant.location),
  })), [restaurants, user?.location]);

  const nearby = useMemo(() => withDistance
    .filter((restaurant) => Number.isFinite(restaurant.distanceKm))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 8), [withDistance]);

  const promoted = useMemo(() => {
    const explicit = withDistance.filter((restaurant) => restaurant.promoted);
    return explicit.length ? explicit : withDistance.slice(0, 8);
  }, [withDistance]);

  const categories = useMemo(() => {
    const grouped = withDistance.reduce((rows, restaurant) => {
      const category = restaurant.category?.trim() || 'Other';
      if (!rows.has(category)) rows.set(category, []);
      rows.get(category).push(restaurant);
      return rows;
    }, new Map());
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [withDistance]);

  const openRestaurant = (restaurant) => navigation.navigate('Restaurant', {
    id: restaurant.id,
    name: restaurant.name,
  });

  if (status === 'loading') return <Loading message="Finding restaurants near you" />;

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="700">We couldn&apos;t load the feed</AppText>
        <AppText muted style={styles.errorText}>{error}</AppText>
        <Button title="Try again" onPress={load} style={styles.retry} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brand} />}
    >
      <View style={styles.hero}>
        <AppText variant="small" muted weight="700" style={styles.eyebrow}>RESTAURANTS NEAR YOU</AppText>
        <AppText variant="title" weight="800">What are you craving?</AppText>
        <AppText muted style={styles.heroSub}>
          {user?.location ? 'Ranked using your saved location.' : 'Log in to rank places by distance.'}
        </AppText>
      </View>

      {nearby.length > 0 && (
        <RestaurantRow title="Near you" restaurants={nearby} onPressRestaurant={openRestaurant} />
      )}
      <RestaurantRow title="Promoted" restaurants={promoted} onPressRestaurant={openRestaurant} />
      {categories.map(([category, list]) => (
        <RestaurantRow key={category} title={category} restaurants={list} onPressRestaurant={openRestaurant} />
      ))}

      {!restaurants.length && <AppText muted style={styles.empty}>No restaurants yet.</AppText>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 28 },
  hero: { paddingHorizontal: 16, marginBottom: 22 },
  eyebrow: { letterSpacing: 1, marginBottom: 4 },
  heroSub: { marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { marginVertical: 8, textAlign: 'center' },
  retry: { alignSelf: 'stretch', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
});

export default HomeScreen;
