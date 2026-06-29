import { createDrawerNavigator } from '@react-navigation/drawer';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import DrawerContent from './DrawerContent';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ManageScreen from '../screens/ManageScreen';
import AccountScreen from '../screens/AccountScreen';

const Drawer = createDrawerNavigator();

// The phone's "menu" — slides in from the side (the mobile counterpart of the
// web top navbar). Orders/Account need a session, and Manage is owner-only, so
// those entries appear only when relevant.
const DrawerNavigator = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const isOwner = user?.role === ROLES.OWNER;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        drawerActiveTintColor: theme.brand,
        drawerInactiveTintColor: theme.muted,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'AdvancedWolt' }} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Cart" component={CartScreen} />
      {isAuthenticated ? <Drawer.Screen name="Orders" component={OrdersScreen} /> : null}
      {isOwner ? <Drawer.Screen name="Manage" component={ManageScreen} /> : null}
      {isAuthenticated ? (
        <Drawer.Screen name="Account" component={AccountScreen} options={{ title: 'Manage account' }} />
      ) : null}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
