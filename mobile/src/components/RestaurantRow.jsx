import { View, FlatList, StyleSheet } from 'react-native';

import RestaurantCard from './RestaurantCard';
import AppText from './AppText';

// A titled, horizontally scrolling shelf of restaurant cards — the mobile take
// on the web feed's category rows. Renders nothing when the shelf is empty.
const RestaurantRow = ({ title, restaurants, onPressRestaurant }) => {
  if (!restaurants.length) return null;

  return (
    <View style={styles.row}>
      <View style={styles.heading}>
        <AppText variant="subtitle" weight="800">{title}</AppText>
        <AppText variant="small" muted>
          {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
        </AppText>
      </View>
      <FlatList
        horizontal
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard restaurant={item} onPress={() => onPressRestaurant(item)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { marginBottom: 22 },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scroll: { paddingHorizontal: 16, gap: 12 },
});

export default RestaurantRow;
