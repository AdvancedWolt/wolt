import { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import AppText from '../components/AppText';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { useTheme } from '../context/ThemeContext';
import { search as searchRequest, getRestaurants } from '../api/endpoints';

const EMPTY = { restaurants: [], products: [] };

// Centred message used for the idle / error / no-results states.
const StateMessage = ({ icon, title, subtitle }) => (
  <View style={styles.centered}>
    <AppText variant="title">{icon}</AppText>
    <AppText variant="subtitle" weight="700" style={styles.stateTitle}>{title}</AppText>
    {subtitle ? <AppText muted style={styles.stateSub}>{subtitle}</AppText> : null}
  </View>
);

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [namesById, setNamesById] = useState({});

  // Restaurant names for the dish cards' "order from" line.
  useEffect(() => {
    getRestaurants().then((data) => {
      if (!Array.isArray(data)) return;
      const map = {};
      data.forEach((restaurant) => { map[restaurant.id] = restaurant.name; });
      setNamesById(map);
    }).catch(() => {});
  }, []);

  // Debounce the query so we don't fire a request on every keystroke.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(EMPTY);
      setStatus('idle');
      return;
    }

    let active = true;
    setStatus('loading');
    setError('');
    const handle = setTimeout(() => {
      searchRequest(trimmed)
        .then((data) => { if (active) { setResults(data || EMPTY); setStatus('ready'); } })
        .catch((err) => { if (active) { setError(err.message || 'Something went wrong'); setStatus('error'); } });
    }, 350);

    return () => { active = false; clearTimeout(handle); };
  }, [query]);

  const openRestaurant = (id, name) => navigation.navigate('Restaurant', { id, name });

  const hasResults = results.restaurants.length > 0 || results.products.length > 0;

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search restaurants or dishes…"
          placeholderTextColor={theme.muted}
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {status === 'idle' && (
          <StateMessage icon="🔍" title="Search restaurants & dishes" subtitle="Find a place or a dish you're craving." />
        )}
        {status === 'loading' && (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.brand} />
            <AppText muted style={styles.stateSub}>Searching…</AppText>
          </View>
        )}
        {status === 'error' && <StateMessage icon="!" title="Search failed" subtitle={error} />}
        {status === 'ready' && !hasResults && (
          <StateMessage icon="🍽️" title="No matches" subtitle={`Nothing matched “${query.trim()}”.`} />
        )}

        {status === 'ready' && hasResults && (
          <>
            {results.restaurants.length > 0 && (
              <View style={styles.section}>
                <AppText variant="subtitle" weight="800">Restaurants ({results.restaurants.length})</AppText>
                {results.restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onPress={() => openRestaurant(restaurant.id, restaurant.name)}
                    style={styles.fullCard}
                  />
                ))}
              </View>
            )}
            {results.products.length > 0 && (
              <View style={styles.section}>
                <AppText variant="subtitle" weight="800">Dishes ({results.products.length})</AppText>
                {results.products.map((product) => (
                  <DishCard
                    key={product.id}
                    product={product}
                    restaurantName={namesById[product.restaurantId]}
                    onPress={() => openRestaurant(product.restaurantId, namesById[product.restaurantId])}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  searchBar: { padding: 16, paddingBottom: 8 },
  input: { height: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  content: { padding: 16, paddingTop: 8 },
  section: { marginBottom: 18, gap: 12 },
  fullCard: { width: '100%' },
  loading: { alignItems: 'center', marginTop: 50 },
  centered: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  stateTitle: { marginTop: 8 },
  stateSub: { marginTop: 4, textAlign: 'center' },
});

export default SearchScreen;
