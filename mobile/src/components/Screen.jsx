import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

import { useTheme } from '../context/ThemeContext';

// Themed page container. `scroll` wraps the children in a keyboard-aware
// ScrollView so a focused input is never left hidden behind the keyboard;
// otherwise it's a plain flex View. The header covers the top inset, so we only
// pad the bottom for the home indicator.
const Screen = ({ children, scroll = false, style, contentStyle }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const base = [styles.fill, { backgroundColor: theme.background }, style];

  if (scroll) {
    return (
      <KeyboardAvoidingView
        style={base}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return <View style={[base, styles.content, contentStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16 },
});

export default Screen;
