import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../config/api';
import { STORAGE_KEYS } from '../storage';

// All HTTP goes through here so the base URL and the bearer token are attached
// once, and every failure surfaces the server's error message the same way.
const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };

  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 204s (e.g. PATCH/DELETE) carry no body to parse.
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
};

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiDelete = (path) => request('DELETE', path);
