// Single source of truth for the backend origin.
//
// A phone or emulator can't use relative URLs or "localhost" (that points at the
// device itself), so every request is prefixed with this. The value comes from
// EXPO_PUBLIC_API_URL at build time; the default targets 10.0.2.2, which is how
// the Android emulator reaches the host machine where `docker compose up` runs.
// For a physical device on Expo Go, set EXPO_PUBLIC_API_URL to your computer's
// LAN address, e.g. http://192.168.1.20:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
