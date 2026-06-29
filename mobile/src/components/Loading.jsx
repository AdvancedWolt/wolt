import { View, ActivityIndicator, StyleSheet } from 'react-native';

import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

// Full-screen centred spinner used for the launch splash and per-screen loads.
const Loading = ({ message }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.brand} />
      {message ? <AppText muted style={styles.message}>{message}</AppText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { marginTop: 12 },
});

export default Loading;
