import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, Image, Pressable, StyleSheet, RefreshControl } from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRestaurants } from '../api/endpoints';
import { distanceInKm } from '../utils/geo';

// The main feed: pulls live restaurants from the server and ranks them by
// distance from the signed-in user. Tapping a card opens its menu. (The richer
// promoted/category rows from the web feed land with EX5-7.)
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

  const ranked = useMemo(() => restaurants
    .map((restaurant) => ({ ...restaurant, distanceKm: distanceInKm(user?.location, restaurant.location) }))
    .sort((left, right) => (left.distanceKm ?? Infinity) - (right.distanceKm ?? Infinity)),
  [restaurants, user?.location]);

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
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImageFallback, { backgroundColor: theme.surface }]}>
          <AppText variant="title">🍽️</AppText>
        </View>
      )}
      <View style={styles.cardBody}>
        <AppText weight="700">{item.name}</AppText>
        <AppText variant="small" muted>
          {item.category || 'Other'}
          {Number.isFinite(item.distanceKm) ? ` · ${item.distanceKm.toFixed(1)} km away` : ''}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View style={styles.header}>
            <AppText variant="title" weight="800">What are you craving?</AppText>
            <AppText muted style={styles.headerSub}>
              {user?.location ? 'Ranked by distance from your saved location.' : 'Log in to rank places by distance.'}
            </AppText>
          </View>
        )}
        ListEmptyComponent={<AppText muted style={styles.empty}>No restaurants yet.</AppText>}
        refreshControl={(
          <RefreshControl refreshing={status === 'loading'} onRefresh={load} tintColor={theme.brand} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 12 },
  header: { marginBottom: 4 },
  headerSub: { marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  cardImage: { width: 88, height: 88 },
  cardImageFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, paddingHorizontal: 14, gap: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { marginVertical: 8, textAlign: 'center' },
  retry: { alignSelf: 'stretch', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
});

export default HomeScreen;
