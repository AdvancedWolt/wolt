import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { login as loginRequest, register as registerRequest } from '../api/endpoints';
import { STORAGE_KEYS, readJSON, writeJSON } from '../storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  // `ready` stays false until storage has been read, so the navigator can hold a
  // splash instead of flashing the wrong screen on launch.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.token),
        readJSON(STORAGE_KEYS.user),
      ]);
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(savedUser);
      setReady(true);
    })();
  }, []);

  const login = async (username, password) => {
    const data = await loginRequest(username, password);
    const nextUser = {
      id: data.userId,
      username: data.username,
      displayName: data.displayName,
      image: data.image,
      role: data.role,
      location: data.location,
    };
    setToken(data.token);
    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEYS.token, data.token);
    await writeJSON(STORAGE_KEYS.user, nextUser);
    return data;
  };

  const register = (newUser) => registerRequest(newUser);

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
  };

  const updateAuthUser = (updatedFields) => {
    setUser((curr) => {
      if (!curr) return null;
      const next = { ...curr, ...updatedFields };
      writeJSON(STORAGE_KEYS.user, next);
      return next;
    });
  };

  const value = {
    user,
    token,
    ready,
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
