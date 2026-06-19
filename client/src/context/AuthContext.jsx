import { createContext, useContext, useEffect, useState } from 'react';

import { login as loginRequest, register as registerRequest } from '../api/endpoints.js';
import { TOKEN_KEY } from '../api/client.js';

// Holds "who is logged in" for the whole app. ProtectedRoute and the navbar
// read from here; pages call login/register/logout instead of touching the API.
const AuthContext = createContext(null);

const USER_KEY = 'aw_user';

export const AuthProvider = ({ children }) => {
    // Initialise from localStorage so a page refresh keeps the session.
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    });

    const login = async (username, password) => {
        const data = await loginRequest(username, password);
        // EX4-2 will return { token }; the current server returns { userId }.
        // Accepting either keeps the skeleton working across that change.
        setToken(data.token ?? data.userId);
        setUser({ username, ...data });
        return data;
    };

    const register = (newUser) => registerRequest(newUser);

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    // Keep localStorage in sync with state in one place, so every part of the
    // app stays consistent and survives a refresh.
    useEffect(() => {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    }, [user]);

    const value = {
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Small hook so components just call useAuth() and get a clear error if they
// forget to wrap the app in <AuthProvider>.
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
