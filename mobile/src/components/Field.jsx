import { View, TextInput, StyleSheet } from 'react-native';

import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

// Labelled text input with an inline error line. The border turns red while an
// error is showing so the problem field is obvious before submitting.
const Field = ({ label, error, style, ...rest }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      {label ? <AppText variant="small" muted style={styles.label}>{label}</AppText> : null}
      <TextInput
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.card, borderColor: error ? theme.danger : theme.border },
        ]}
        {...rest}
      />
      {error ? <AppText variant="small" color={theme.danger} style={styles.error}>{error}</AppText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 15 },
  error: { marginTop: 4 },
});

export default Field;
