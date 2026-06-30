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
    screens/             Login, Register, Home, Cart, Orders, Manage, details
```

## Pointing the app at the server

The phone/emulator can't reach the server over `localhost`, so the base URL is
configurable via `EXPO_PUBLIC_API_URL` (see `src/config/api.js`):

- **Android emulator:** nothing to set when Docker exposes the API on the host.
  The default `http://10.0.2.2:3000` reaches the host machine where
  `docker compose up --build` publishes the Node API.
- **Physical phone (Expo Go):** set it to your computer's LAN address, e.g.
  `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start`.
- **WSL with Android emulator on Windows:** if the emulator cannot reach the
  API directly, expose the API from WSL to Windows first, then start Expo with
  that port. Example:
  ```bash
  # In WSL, from any directory:
  python3 - <<'PY'
  import socket, threading
  src = ('0.0.0.0', 3001)
  dst = ('127.0.0.1', 3000)
  def pipe(a, b):
      try:
          while True:
              data = a.recv(65536)
              if not data: break
              b.sendall(data)
      finally:
          a.close(); b.close()
  s = socket.socket()
  s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  s.bind(src); s.listen()
  print(f'proxy listening on {src} -> {dst}', flush=True)
  while True:
      client, _ = s.accept()
      server = socket.create_connection(dst)
      threading.Thread(target=pipe, args=(client, server), daemon=True).start()
      threading.Thread(target=pipe, args=(server, client), daemon=True).start()
  PY
  ```
  Then run Expo with `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001`.

## Running

1. Start the backend from the repo root:
   ```bash
   docker compose up --build
   ```
   This starts MongoDB, the C++ recommender service, and the Node API. The API
   connects to MongoDB and seeds the empty database on boot.
2. Start the app:
   ```bash
   cd mobile
   npm install
   npm run android      # or: npx expo start  → press a / scan the QR in Expo Go
   ```
   Do not commit `node_modules`; dependencies are installed locally only.

## Smoke test against Docker + MongoDB

After `docker compose up --build` and Expo are running:

1. Open the app on the emulator or device.
2. Confirm the Home feed lists seeded restaurants.
3. Log in with a seeded user from `web/src/seed.js` or register a new account.
4. For owner management, register or log in as a `restaurant_owner`, open
   **Manage**, create a restaurant, add a dish, edit both, then delete the
   restaurant. The restaurant delete path removes its menu on the server.
5. Pull to refresh Home or Manage to confirm the catalog is still live data from
   MongoDB, not local fake state.

## Status

Login, Register, Home, Cart, Orders, and owner Management are live against the
Express + MongoDB API. The app uses AsyncStorage for auth/cart persistence and
the shared API wrapper attaches JWTs to protected requests.
