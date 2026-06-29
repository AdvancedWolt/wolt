import { Pressable, View, StyleSheet } from 'react-native';

import Thumbnail from './Thumbnail';
import AppText from './AppText';
import { formatPrice } from '../utils/format';
import { useTheme } from '../context/ThemeContext';

// A dish search result: thumbnail, name + price, description, and a link through
// to the restaurant it belongs to.
const DishCard = ({ product, restaurantName, onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Thumbnail src={product.image} name={product.name} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <AppText weight="700" numberOfLines={1} style={styles.name}>{product.name}</AppText>
          <AppText weight="700" color={theme.brand}>{formatPrice(product.price)}</AppText>
        </View>
        <AppText variant="small" muted numberOfLines={2}>
          {product.description || 'No description provided'}
        </AppText>
        {restaurantName ? (
          <AppText variant="small" color={theme.brand} weight="700" style={styles.link}>
            Order from {restaurantName} →
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  image: { width: 92, height: 92 },
  body: { flex: 1, padding: 10, gap: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1 },
  link: { marginTop: 2 },
});

export default DishCard;
