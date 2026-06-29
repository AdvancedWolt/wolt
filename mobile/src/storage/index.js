import AsyncStorage from '@react-native-async-storage/async-storage';

// One place names every persisted key so the contexts can never drift on the
// raw strings.
export const STORAGE_KEYS = {
  token: 'aw_token',
  user: 'aw_user',
  cart: 'aw_cart',
  theme: 'aw_theme',
};

// JSON helpers. A read returns null on a missing or corrupt value (and clears
// the bad entry) instead of throwing, so a single broken key can't wedge boot.
export const readJSON = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
};

export const writeJSON = async (key, value) => {
  if (value === null || value === undefined) await AsyncStorage.removeItem(key);
  else await AsyncStorage.setItem(key, JSON.stringify(value));
};
