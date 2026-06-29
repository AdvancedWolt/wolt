import { Pressable, View, StyleSheet } from 'react-native';

import Thumbnail from './Thumbnail';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

// A restaurant tile: image on top, name/category/distance below, with a promoted
// badge when relevant. Used in the home rows and the search results. The default
// fixed width suits a horizontal row; pass `style` to override (e.g. full width).
const RestaurantCard = ({ restaurant, onPress, style }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <View style={styles.media}>
        <Thumbnail src={restaurant.image} name={restaurant.name} style={styles.image} />
        {restaurant.promoted ? (
          <View style={[styles.badge, { backgroundColor: theme.brand }]}>
            <AppText variant="small" weight="700" color={theme.onBrand}>Promoted</AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <AppText weight="700" numberOfLines={1}>{restaurant.name}</AppText>
        <AppText variant="small" muted numberOfLines={1}>
          {restaurant.category || 'Other'}
          {Number.isFinite(restaurant.distanceKm) ? ` · ${restaurant.distanceKm.toFixed(1)} km` : ''}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { width: 190, borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  media: { position: 'relative' },
  image: { width: '100%', height: 120 },
  badge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  body: { padding: 10, gap: 3 },
});

export default RestaurantCard;
