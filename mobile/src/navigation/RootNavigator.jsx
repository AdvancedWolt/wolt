import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';

import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

const Stack = createNativeStackNavigator();

// The drawer holds the main sections; detail and auth screens sit above it on a
// stack so they get a back button and cover the drawer. Browsing is public, so
// Login is just another pushable screen rather than a hard gate.
const RootNavigator = () => {
  const { ready: authReady } = useAuth();
  const { ready: cartReady } = useCart();
  const { theme, isDark } = useTheme();

  // Hold a splash until the persisted session and cart are restored.
  if (!authReady || !cartReady) return <Loading message="Loading AdvancedWolt…" />;

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.brand,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.brand,
    },
  };

  const headerOptions = {
    headerStyle: { backgroundColor: theme.card },
    headerTintColor: theme.text,
    headerTitleStyle: { color: theme.text },
    contentStyle: { backgroundColor: theme.background },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {/* Light icons on the dark theme's dark backgrounds, and vice versa. */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: 'Restaurant' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
