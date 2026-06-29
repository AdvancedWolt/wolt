import { Modal, View, StyleSheet } from 'react-native';

import AppText from './AppText';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

// In-app confirmation modal, used instead of the native Alert so it follows the
// app's theme. Mirrors the web client's ConfirmDialog.
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
  const { theme } = useTheme();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {title ? <AppText variant="subtitle" weight="800">{title}</AppText> : null}
          {message ? <AppText muted style={styles.message}>{message}</AppText> : null}
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="secondary" onPress={onCancel} style={styles.btn} />
            <Button title={confirmLabel} onPress={onConfirm} style={styles.btn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 16, padding: 20, gap: 8 },
  message: { marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1 },
});

export default ConfirmDialog;
