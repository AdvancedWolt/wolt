import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';

import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

// Primary (filled) and secondary (outlined) button. Shows a spinner while
// `loading` and dims when disabled.
const Button = ({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) => {
  const { theme } = useTheme();
  const isSecondary = variant === 'secondary';
  const background = isSecondary ? 'transparent' : theme.brand;
  const foreground = isSecondary ? theme.brand : theme.onBrand;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, borderColor: theme.brand },
        isSecondary && styles.secondary,
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={foreground} />
        : <AppText weight="700" color={foreground}>{title}</AppText>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondary: { borderWidth: 1.5 },
});

export default Button;
