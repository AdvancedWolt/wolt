import { View, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Custom drawer: a profile header on top, the auto-generated section links in the
// middle, then the theme toggle and the login/logout action pinned at the bottom.
const DrawerContent = (props) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    props.navigation.closeDrawer();
    props.navigation.navigate('Home');
  };

  const initial = (user?.displayName || user?.username || 'A')[0].toUpperCase();

  return (
    <View style={[styles.fill, { backgroundColor: theme.card }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top + 8 }}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          {isAuthenticated && user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.brand }]}>
              <AppText weight="800" color={theme.onBrand}>{initial}</AppText>
            </View>
          )}
          <AppText variant="subtitle" weight="800">
            {isAuthenticated ? (user?.displayName || user?.username) : 'Welcome'}
          </AppText>
          <AppText variant="small" muted>
            {isAuthenticated ? `@${user?.username}` : 'Browsing as a guest'}
          </AppText>
        </View>

        <DrawerItemList {...props} />

        <DrawerItem
          label={isDark ? 'Light mode' : 'Dark mode'}
          labelStyle={{ color: theme.text }}
          onPress={toggleTheme}
        />
      </DrawerContentScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: insets.bottom + 8 }]}>
        {isAuthenticated ? (
          <DrawerItem label="Log out" labelStyle={{ color: theme.danger }} onPress={handleLogout} />
        ) : (
          <DrawerItem
            label="Log in"
            labelStyle={{ color: theme.brand }}
            onPress={() => props.navigation.navigate('Login')}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, marginBottom: 8, borderBottomWidth: 1, gap: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  footer: { borderTopWidth: 1, paddingTop: 4 },
});

export default DrawerContent;
