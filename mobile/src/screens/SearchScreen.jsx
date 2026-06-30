import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import AppText from '../components/AppText';
import Field from '../components/Field';
import { getRestaurants, search } from '../api/endpoints';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/format';

const emptyResults = { restaurants: [], products: [] };

// Global search across restaurants and dishes (EX5-8). Mirrors the web Search
// page: one query hits GET /api/search/:query, which returns matching
// restaurants and products together. Tapping any result opens its restaurant.
const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(emptyResults);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState('');
  const [restaurantNames, setRestaurantNames] = useState({});
  // Bumped per request so a slow earlier response can't overwrite a newer one.
  const requestId = useRef(0);

  // Map restaurantId -> name so dish results can show where each dish is from
  // (the dish payload only carries the id), same as the web client does.
  useEffect(() => {
    getRestaurants()
      .then((data) => {
        if (!Array.isArray(data)) return;
        const map = {};
        data.forEach((restaurant) => { map[restaurant.id] = restaurant.name; });
        setRestaurantNames(map);
      })
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setResults(emptyResults);
      setStatus('idle');
      setError('');
      return;
    }

    const id = ++requestId.current;
    setStatus('loading');
    setError('');
    try {
      const data = await search(trimmed);
      if (id !== requestId.current) return; // superseded by a newer query
      setResults(data || emptyResults);
      setStatus('ready');
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message || 'Something went wrong during search.');
      setStatus('error');
    }
  }, []);

  // Search as you type, debounced so we don't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  const restaurants = results.restaurants || [];
  const products = results.products || [];
  const hasResults = restaurants.length > 0 || products.length > 0;

  const openRestaurant = (id, name) => {
    if (!id) return;
    navigation.navigate('Restaurant', { id, name });
  };

  const renderRestaurant = (restaurant) => (
    <Pressable
      key={restaurant.id}
      onPress={() => openRestaurant(restaurant.id, restaurant.name)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.imageFallback, { backgroundColor: theme.surface }]}>
          <AppText variant="title">🍽️</AppText>
        </View>
      )}
      <View style={styles.cardBody}>
        <AppText weight="700">{restaurant.name}</AppText>
        <AppText variant="small" muted>{restaurant.category || 'Other'}</AppText>
      </View>
    </Pressable>
  );

  const renderDish = (product) => {
    const restaurantName = restaurantNames[product.restaurantId];
    return (
      <Pressable
        key={product.id}
        onPress={() => openRestaurant(product.restaurantId, restaurantName)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imageFallback, { backgroundColor: theme.surface }]}>
            <AppText variant="title">🍽️</AppText>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.dishHeader}>
            <AppText weight="700" style={styles.dishName}>{product.name}</AppText>
            <AppText weight="800">{formatPrice(product.price)}</AppText>
          </View>
          {restaurantName ? <AppText variant="small" muted>{restaurantName}</AppText> : null}
          {product.description ? (
            <AppText variant="small" muted numberOfLines={2}>{product.description}</AppText>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.fill, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <AppText variant="title" weight="800">
          {query.trim() ? `Results for “${query.trim()}”` : 'Find restaurants & dishes'}
        </AppText>
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search restaurants & dishes"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => runSearch(query)}
          style={styles.searchField}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {status === 'idle' ? (
          <View style={styles.state}>
            <AppText variant="title">🔍</AppText>
            <AppText variant="subtitle" weight="700">Search restaurants and dishes</AppText>
            <AppText muted style={styles.stateText}>
              Type above to find a place or a dish you&apos;re craving.
            </AppText>
          </View>
        ) : null}

        {status === 'loading' ? (
          <View style={styles.state}>
            <AppText variant="subtitle" weight="700">Searching our menu…</AppText>
            <AppText muted style={styles.stateText}>Looking up matches for your query.</AppText>
          </View>
        ) : null}

        {status === 'error' ? (
          <View style={styles.state}>
            <AppText variant="subtitle" weight="700">Search failed</AppText>
            <AppText muted style={styles.stateText}>{error}</AppText>
          </View>
        ) : null}

        {status === 'ready' && !hasResults ? (
          <View style={styles.state}>
            <AppText variant="title">🍽️</AppText>
            <AppText variant="subtitle" weight="700">No matches found</AppText>
            <AppText muted style={styles.stateText}>
              Nothing matched “{query.trim()}”. Try checking your spelling or searching for
              something else.
            </AppText>
          </View>
        ) : null}

        {status === 'ready' && hasResults ? (
          <View style={styles.results}>
            {restaurants.length ? (
              <View style={styles.section}>
                <AppText variant="subtitle" weight="800">Restaurants ({restaurants.length})</AppText>
                {restaurants.map(renderRestaurant)}
              </View>
            ) : null}

            {products.length ? (
              <View style={styles.section}>
                <AppText variant="subtitle" weight="800">Dishes &amp; items ({products.length})</AppText>
                {products.map(renderDish)}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { padding: 16, paddingBottom: 4, gap: 10 },
  searchField: { marginBottom: 0 },
  content: { padding: 16, paddingTop: 8, gap: 18 },
  results: { gap: 18 },
  section: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  cardImage: { width: 88, height: 88 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  dishHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  dishName: { flex: 1 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 8 },
  stateText: { textAlign: 'center', paddingHorizontal: 24 },
});

export default SearchScreen;
