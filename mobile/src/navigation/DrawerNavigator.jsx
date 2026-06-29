import { createDrawerNavigator } from '@react-navigation/drawer';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import DrawerContent from './DrawerContent';
import ProtectedScreen from './ProtectedScreen';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ManageScreen from '../screens/ManageScreen';
import AccountScreen from '../screens/AccountScreen';

const Drawer = createDrawerNavigator();

const protectedComponent = (Component, requiredRole) => function ProtectedDrawerScreen(props) {
  return (
    <ProtectedScreen {...props} requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedScreen>
  );
};

const ProtectedCartScreen = protectedComponent(CartScreen);
const ProtectedOrdersScreen = protectedComponent(OrdersScreen);
const ProtectedManageScreen = protectedComponent(ManageScreen, ROLES.OWNER);
const ProtectedAccountScreen = protectedComponent(AccountScreen);

// The phone's "menu" — slides in from the side (the mobile counterpart of the
// web top navbar). Private screens stay registered so direct navigation can be
// guarded instead of disappearing into an unknown route.
const DrawerNavigator = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
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
      <Drawer.Screen name="Cart" component={ProtectedCartScreen} />
      <Drawer.Screen name="Orders" component={ProtectedOrdersScreen} />
      <Drawer.Screen
        name="Manage"
        component={ProtectedManageScreen}
        options={{ drawerItemStyle: isOwner ? undefined : { display: 'none' } }}
      />
      <Drawer.Screen name="Account" component={ProtectedAccountScreen} options={{ title: 'Manage account' }} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
