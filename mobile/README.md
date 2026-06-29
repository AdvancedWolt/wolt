# AdvancedWolt – Mobile (React Native)

The Wolt-style mobile client for Exercise 5. It talks to the same Exercise 3
Express + MongoDB server as the web client (`../client`) — no mock data, every
screen reads live from the API.

Built with **Expo** + **React Navigation** (drawer + stack). The drawer is the
phone's take on the web's top navbar: it slides in from the side.

## Structure

```
mobile/
  App.js                 providers (theme / auth / cart) + navigator
  src/
    config/api.js        single source for the backend URL
    api/                 fetch wrapper (base URL + token) and named endpoints
    storage/             AsyncStorage keys + JSON helpers
    theme/tokens.js      light/dark colour tokens
    context/             ThemeContext, AuthContext, CartContext
    navigation/          root stack, drawer, custom drawer content
    components/          Screen, AppText, Button, Field, Loading, Placeholder
    hooks/               useImagePicker (expo-image-picker → base64)
    utils/               validators, geo (distance), price format
    screens/             Login, Register, Home (+ stubs for later tickets)
```

## Pointing the app at the server

The phone/emulator can't reach the server over `localhost`, so the base URL is
configurable via `EXPO_PUBLIC_API_URL` (see `src/config/api.js`):

- **Android emulator:** nothing to set — the default `http://10.0.2.2:3000`
  reaches the host machine where the backend runs.
- **Physical phone (Expo Go):** set it to your computer's LAN address, e.g.
  `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start`.

## Running

1. Start the backend from the repo root:
   ```bash
   docker compose up --build
   ```
2. Start the app:
   ```bash
   cd mobile
   npm install
   npm run android      # or: npx expo start  → press a / scan the QR in Expo Go
   ```

## Status

This is the structural foundation (EX5-4 scaffold/navigation/API, EX5-6
drawer/theme/logout, and the session core of EX5-5). Login, Register and the
Home feed are live; the remaining screens are themed stubs that each name the
ticket that completes them.
