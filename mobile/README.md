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

The phone/emulator **cannot reach the server over `localhost`** — on a device,
`localhost` means the device itself, not your computer. So every request is
prefixed with a configurable base URL, `EXPO_PUBLIC_API_URL`
(single source of truth: `src/config/api.js`). If it is unset, the app falls
back to `http://10.0.2.2:3000`, which is the Android emulator's alias for the
host machine.

### 1. Pick the right address for how you run the app

| You are running the app on…            | Use this `EXPO_PUBLIC_API_URL`        | Why                                                            |
| -------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Android emulator** (AVD)             | *leave unset* → default `http://10.0.2.2:3000` | `10.0.2.2` is the emulator's special alias for the host's `localhost`. |
| **iOS simulator** (macOS)              | `http://localhost:3000`               | The simulator shares the Mac's network stack.                 |
| **Physical phone, Expo Go** (Android/iOS) | `http://<YOUR-PC-LAN-IP>:3000`, e.g. `http://192.168.1.20:3000` | The phone reaches your PC over Wi‑Fi by its LAN IP. |
| **Web preview** (`npm run web`)        | `http://localhost:3000`               | Runs in the desktop browser on the host.                      |

> The default exists so a grader running the **Android emulator** needs to set
> **nothing** — just `docker compose up --build` then `npm run android`.

### 2. Find your computer's LAN IP (only needed for a physical phone)

- **Windows (PowerShell):**
  ```powershell
  (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object InterfaceAlias -match 'Wi-Fi|Ethernet' |
    Where-Object IPAddress -notlike '169.*').IPAddress
  ```
  Or run `ipconfig` and read the **IPv4 Address** under your active Wi‑Fi /
  Ethernet adapter (typically `192.168.x.x` or `10.0.x.x`).
- **macOS:** `ipconfig getifaddr en0` (Wi‑Fi) or `ipconfig getifaddr en1`.
- **Linux:** `hostname -I` and take the first `192.168.*` / `10.*` address.

Ignore `127.0.0.1`, `169.254.*` (link‑local), and the WSL/Hyper‑V adapter
(`172.x.x.x`) — those are not reachable from your phone.

### 3. Set the variable (three equivalent ways)

**Option A — `.env` file (recommended, foolproof, no shell syntax to remember).**
Expo (SDK 49+) auto‑loads `EXPO_PUBLIC_*` variables from `mobile/.env`. Create
the file once and every `expo start` picks it up:
```bash
# mobile/.env  (physical phone example — change the IP to YOUR LAN IP)
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
```
Then just run `npx expo start` normally. (Delete or empty the file to fall back
to the emulator default.) `.env` is git‑ignored, so it won't be committed.

**Option B — Windows PowerShell** (the inline `VAR=... command` form is *bash
only* and fails in PowerShell):
```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.20:3000"
npx expo start
```

**Option C — macOS / Linux / Git Bash** (inline, one‑off):
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
```

> ⚠️ `EXPO_PUBLIC_*` values are **baked in when Expo starts**. After creating or
> changing the variable, fully **stop and restart** `expo start` (press `r` to
> reload is not enough if the value changed).

### 4. Make sure the phone can actually reach the API

When using a **physical phone**, confirm all of these:

1. **Same network:** phone and PC are on the **same Wi‑Fi** (and the network is
   not "client‑isolated"/guest mode, which blocks device‑to‑device traffic).
2. **API listens on all interfaces:** `docker compose up --build` publishes the
   Node API on the host's `0.0.0.0:3000`, so this is already satisfied. (A bare
   `node` server bound only to `127.0.0.1` would *not* be reachable.)
3. **Firewall allows port 3000:** on Windows, allow Node.js / TCP port `3000`
   for **Private** networks (Windows Defender Firewall → *Allow an app* or add
   an inbound rule). This is the most common reason a phone "can't connect".
4. **Quick sanity check:** open `http://<YOUR-PC-LAN-IP>:3000` in the phone's
   **browser**. If the API responds there, Expo Go will too; if it doesn't, it's
   a network/firewall issue, not an app issue.

### 5. WSL with the Android emulator on Windows

If you run the backend inside **WSL** but the Android emulator on Windows can't
reach it directly, forward the WSL port to Windows, then point Expo at the
forwarded port. Example proxy:
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
Then start Expo with `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001`.

### Troubleshooting "Network request failed"

| Symptom                                          | Likely cause & fix                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Works on emulator, fails on physical phone       | Wrong base URL — you used `10.0.2.2`/`localhost` instead of the **PC LAN IP**.     |
| Phone browser can't open `http://<PC-IP>:3000`   | Firewall blocking port 3000, or phone/PC on **different Wi‑Fi** / guest network.   |
| Changed the IP but the app still hits the old one| `EXPO_PUBLIC_*` is baked at start — **fully restart** `expo start`.                |
| Emulator can't reach `10.0.2.2`                  | API isn't published on the host (run `docker compose up --build`) or wrong port.   |
| All requests 404 / wrong data                    | Backend not seeded yet — wait for the API to finish seeding MongoDB on boot.       |

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
