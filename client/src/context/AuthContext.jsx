import { createContext, useContext, useEffect, useState } from 'react';

import { login as loginRequest, register as registerRequest } from '../api/endpoints.js';
import { TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

const USER_KEY = 'aw_user';

export const AuthProvider = ({ children }) => {
    // Initialise from localStorage so a refresh keeps the user signed in.
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    });

    const login = async (username, password) => {
        const data = await loginRequest(username, password);
        setToken(data.token);
        setUser({
            id: data.userId,
            username: data.username,
            displayName: data.displayName,
            image: data.image,
            role: data.role,
            location: data.location,
        });
        return data;
    };

    const register = (newUser) => registerRequest(newUser);

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const updateAuthUser = (updatedFields) => {
        setUser((curr) => {
            if (!curr) return null;
            return {
                ...curr,
                ...updatedFields
            };
        });
    };

    // Mirror auth state to localStorage so it survives a page reload.
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
        updateAuthUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
