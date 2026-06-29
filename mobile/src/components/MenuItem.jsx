import { View, Pressable, StyleSheet } from 'react-native';

import Thumbnail from './Thumbnail';
import AppText from './AppText';
import { formatPrice } from '../utils/format';
import { useTheme } from '../context/ThemeContext';

// A single dish row in a restaurant menu: thumbnail, name/description/price, and
// an add button that shows how many are already in the cart.
const MenuItem = ({ product, quantity, onAdd }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <Thumbnail src={product.image} name={product.name} style={styles.image} />
      <View style={styles.copy}>
        <AppText weight="700" numberOfLines={1}>{product.name}</AppText>
        <AppText variant="small" muted numberOfLines={2}>
          {product.description || 'No description provided'}
        </AppText>
        <AppText weight="700" color={theme.brand} style={styles.price}>{formatPrice(product.price)}</AppText>
      </View>
      <View style={styles.action}>
        {quantity > 0 ? (
          <View style={[styles.qty, { backgroundColor: theme.brandSoft }]}>
            <AppText variant="small" weight="800" color={theme.brand}>{quantity}</AppText>
          </View>
        ) : null}
        <Pressable
          onPress={() => onAdd(product)}
          style={({ pressed }) => [styles.add, { borderColor: theme.brand, opacity: pressed ? 0.6 : 1 }]}
        >
          <AppText weight="700" color={theme.brand}>+ Add</AppText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  image: { width: 64, height: 64, borderRadius: 10 },
  copy: { flex: 1, gap: 3 },
  price: { marginTop: 2 },
  action: { alignItems: 'center', gap: 6 },
  qty: { minWidth: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  add: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
});

export default MenuItem;
