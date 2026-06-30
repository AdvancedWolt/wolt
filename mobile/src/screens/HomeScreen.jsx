import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, Image, Pressable, StyleSheet, RefreshControl } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRestaurants } from '../api/endpoints';
import { distanceInKm } from '../utils/geo';
import { ROLES } from '../constants';

// The main feed: pulls live restaurants and groups them into discovery rows —
// "Near you" (closest by distance), "Promoted", then one row per category —
// matching the web Home page.
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
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

  const withDistance = useMemo(() => restaurants
    .map((restaurant) => ({ ...restaurant, distanceKm: distanceInKm(user?.location, restaurant.location) })),
  [restaurants, user?.location]);

  const nearby = useMemo(() => withDistance
    .filter((restaurant) => Number.isFinite(restaurant.distanceKm))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 5),
  [withDistance]);

  const promoted = useMemo(() => {
    const explicit = withDistance.filter((restaurant) => restaurant.promoted);
    return explicit.length ? explicit : withDistance.slice(0, 5);
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

  // Each discovery row is one item in the outer vertical list; restaurants scroll
  // horizontally within it.
  const sections = useMemo(() => {
    const rows = [];
    if (nearby.length) rows.push({ key: 'near', title: 'Near you', data: nearby });
    if (promoted.length) rows.push({ key: 'promoted', title: 'Promoted', data: promoted });
    categories.forEach(([category, list]) => rows.push({ key: `cat-${category}`, title: category, data: list }));
    return rows;
  }, [nearby, promoted, categories]);

  if (status === 'loading' && !restaurants.length) {
    return <Loading message="Finding restaurants near you" />;
  }

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AppText variant="subtitle" weight="700">We couldn&apos;t load the feed</AppText>
        <AppText muted style={styles.errorText}>{error}</AppText>
        <Button title="Try again" onPress={load} style={styles.retry} />
      </View>
    );
  }

  const renderCard = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImageFallback, { backgroundColor: theme.surface }]}>
          <AppText variant="title">🍽️</AppText>
        </View>
      )}
      <View style={styles.cardBody}>
        <AppText weight="700" numberOfLines={1}>{item.name}</AppText>
        <AppText variant="small" muted numberOfLines={1}>
          {item.category || 'Other'}
          {Number.isFinite(item.distanceKm) ? ` · ${item.distanceKm.toFixed(1)} km` : ''}
        </AppText>
      </View>
    </Pressable>
  );

  const renderRow = ({ item }) => (
    <View style={styles.section}>
      <AppText variant="subtitle" weight="800" style={styles.sectionTitle}>{item.title}</AppText>
      <FlatList
        horizontal
        data={item.data}
        keyExtractor={(restaurant) => restaurant.id}
        renderItem={renderCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={sections}
        keyExtractor={(section) => section.key}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View style={styles.header}>
            <AppText variant="title" weight="800">What are you craving?</AppText>
            <AppText muted style={styles.headerSub}>
              {user?.location ? 'Ranked by distance from your saved location.' : 'Log in to rank places by distance.'}
            </AppText>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <AppText variant="subtitle" weight="800">No restaurants yet</AppText>
            {user?.role === ROLES.OWNER ? (
              <>
                <AppText muted style={styles.emptyText}>Be the first to add a restaurant to the platform.</AppText>
                <Button title="Go to Manage" onPress={() => navigation.navigate('Manage')} style={styles.emptyButton} />
              </>
            ) : (
              <AppText muted style={styles.emptyText}>New places will appear here as soon as they are added.</AppText>
            )}
          </View>
        )}
        refreshControl={(
          <RefreshControl refreshing={status === 'loading'} onRefresh={load} tintColor={theme.brand} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 18 },
  header: { marginBottom: 2 },
  headerSub: { marginTop: 4 },
  section: { gap: 10 },
  sectionTitle: { paddingHorizontal: 2 },
  row: { gap: 12, paddingRight: 4 },
  card: { width: 220, borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120 },
  cardImageFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { marginVertical: 8, textAlign: 'center' },
  retry: { alignSelf: 'stretch', marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { textAlign: 'center' },
  emptyButton: { alignSelf: 'stretch', marginTop: 8 },
});

export default HomeScreen;
