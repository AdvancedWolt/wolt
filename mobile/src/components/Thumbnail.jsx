import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

// Shows an image, falling back to the first initial of `name` when there's no
// image or it fails to load. The caller passes the size/shape via `style`.
const Thumbnail = ({ src, name, style, rounded = false }) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const shape = rounded ? { borderRadius: 999 } : null;

  if (src && !failed) {
    return <Image source={{ uri: src }} style={[style, shape]} onError={() => setFailed(true)} />;
  }

  return (
    <View style={[style, shape, styles.fallback, { backgroundColor: theme.surface }]}>
      <AppText variant="title" muted>{name?.slice(0, 1).toUpperCase() || '?'}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});

export default Thumbnail;
