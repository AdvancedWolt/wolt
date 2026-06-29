import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';

// Themed page container. `scroll` wraps the children in a ScrollView, otherwise
// it's a plain flex View. The drawer header covers the top inset, so we only pad
// the bottom for the home indicator.
const Screen = ({ children, scroll = false, style, contentStyle }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const base = [styles.fill, { backgroundColor: theme.background }, style];

  if (scroll) {
    return (
      <View style={base}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[base, styles.content, contentStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16 },
});

export default Screen;
