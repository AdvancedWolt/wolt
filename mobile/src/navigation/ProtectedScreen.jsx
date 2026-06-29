import { useEffect } from 'react';

import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

const ProtectedScreen = ({ children, navigation, route, requiredRole }) => {
  const { isAuthenticated, ready, user } = useAuth();

  useEffect(() => {
    if (!ready || isAuthenticated) return;

    const params = { redirectTo: { screen: route.name } };
    const rootNavigation = navigation.getParent();
    if (rootNavigation) rootNavigation.navigate('Login', params);
    else navigation.navigate('Login', params);
  }, [isAuthenticated, navigation, ready, route.name]);

  useEffect(() => {
    if (!ready || !isAuthenticated || !requiredRole || user?.role === requiredRole) return;

    navigation.navigate('Home');
  }, [isAuthenticated, navigation, ready, requiredRole, user?.role]);

  if (!ready || !isAuthenticated) return <Loading message="Opening login..." />;
  if (requiredRole && user?.role !== requiredRole) return <Loading message="Opening home..." />;

  return children;
};

export default ProtectedScreen;
