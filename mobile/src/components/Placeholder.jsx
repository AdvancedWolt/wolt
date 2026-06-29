import { View, StyleSheet } from 'react-native';

import Screen from './Screen';
import AppText from './AppText';

// Temporary stub for screens owned by later sprint tickets. It keeps navigation
// complete so the foundation runs end to end; each is replaced as its ticket
// lands.
const Placeholder = ({ title, ticket, note }) => (
  <Screen>
    <View style={styles.center}>
      <AppText variant="title" weight="800">{title}</AppText>
      {ticket ? <AppText muted style={styles.line}>Coming in {ticket}</AppText> : null}
      {note ? <AppText muted style={styles.line}>{note}</AppText> : null}
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  line: { marginTop: 6, textAlign: 'center' },
});

export default Placeholder;
