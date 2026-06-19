import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

// Wraps private routes: signed-out users are redirected to the login page.
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
