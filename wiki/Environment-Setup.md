# Environment Setup — Raising the whole system

This page walks through bringing up **the entire stack** with `docker-compose` and running
**both** clients (web and mobile) against it. Follow the steps in order.

> ⬅ Back to the [wiki home](Home.md).

---

## 0. Prerequisites

This section is exhaustive on purpose: install exactly what's listed and the system will build
and run. The **backend stack is fully containerized**, so for the web app you only need Docker —
no local Node, C++ compiler, or MongoDB. You only need a Node toolchain for the **mobile** app.

### 0.1 What you must install

**For the backend + web client (required):**

- **Docker Desktop** — the only requirement to run the whole backend (C++ recommender,
  MongoDB, Express API, and the built web client).
  - Windows/macOS: install **Docker Desktop** (latest). On Windows it uses the **WSL 2**
    backend — Docker Desktop installs/enables WSL 2 for you; just keep it enabled.
  - Linux: Docker Engine + the **Compose v2 plugin**.
  - It must provide **Compose v2** — i.e. the `docker compose` (space) command, *not* the old
    `docker-compose` (hyphen). The `docker-compose.yml` here uses healthchecks and
    `depends_on: condition: service_healthy`, which require Compose v2.
- **An internet connection for the first build.** The first `docker compose up --build` pulls
  the base images (`gcc:15`, `node:20-alpine`, `mongo:7`) and runs `npm install` for the API
  and web client. Expect the **C++ image to take several minutes** to compile the first time;
  later runs are cached and start in seconds.
- **~3–4 GB free disk** for the images and the Mongo volume.

**For the mobile client (only if you run the mobile app):**

- **Node.js 20 LTS or newer** and **npm** (bundled with Node). Expo SDK 54 requires Node ≥ 20.
- **One** mobile runtime:
  - **Recommended — a physical phone with the Expo Go app** (Android or iOS). This needs **no**
    Android Studio, JDK, or native SDK: the app runs inside Expo Go. The phone and your computer
    must be on the **same Wi‑Fi**. Make sure the installed **Expo Go supports SDK 54** (install
    the current version from the store).
  - **Android emulator** — install **Android Studio**, which bundles the Android SDK, a JDK, and
    the emulator (AVD). Create and start one virtual device. You still run the app via Expo Go
    inside the emulator (`npm run android`), so no Gradle/native build setup is required.

> ℹ️ You do **not** need to install a C++ compiler, CMake, or MongoDB locally — all three run in
> containers. You also don't need the Expo CLI globally; `npx expo` is invoked via the project's
> npm scripts.

### 0.2 Pinned versions (what the project builds against)

You don't install these yourself (Docker and npm handle them), but they document the exact
toolchain so a version mismatch can be ruled out:

| Area                | Pinned version                         | Where                         |
| ------------------- | -------------------------------------- | ----------------------------- |
| C++ build image     | `gcc:15` + CMake                       | root `Dockerfile`             |
| API / web build     | **Node 20** (`node:20-alpine`)         | `web/Dockerfile`              |
| Database            | **MongoDB 7** (`mongo:7`)              | `docker-compose.yml`          |
| Express             | `^5.2.1`                               | `web/package.json`            |
| Mongoose            | `^8.9.5`                               | `web/package.json`            |
| jsonwebtoken (JWT)  | `^9.0.2`                               | `web/package.json`            |
| Mobile — Node       | **≥ 20 LTS**                           | required by Expo SDK 54       |
| Mobile — Expo SDK   | **54** (`expo ^54.0.35`)               | `mobile/package.json`         |
| Mobile — React Native | **0.81.5**                           | `mobile/package.json`         |
| Mobile — React      | **19.1.0**                             | `mobile/package.json`         |

### 0.3 Verify your toolchain before starting

```bash
docker --version            # Docker present
docker compose version      # MUST work (Compose v2). If "docker-compose" only → upgrade.
docker info                 # daemon is running (Docker Desktop started)

# Mobile only:
node --version              # v20.x or newer
npm --version
```

### 0.4 Ports & network

| Port    | Used by                    | Exposed to host? | Must be free on host |
| ------- | -------------------------- | ---------------- | -------------------- |
| `3000`  | Express API + web client   | **yes**          | **yes**              |
| `8080`  | C++ recommender            | **yes**          | **yes**              |
| `27017` | MongoDB                    | no (internal)    | no — can't clash     |

If `3000` or `8080` is already taken on your machine, stop whatever is using it (or the stack
will fail to bind). MongoDB is intentionally **not** published, so a local MongoDB won't clash.

### 0.5 No secrets or config files needed

The backend needs **no `.env` and no secrets**: the connection string and ports are provided by
`docker-compose.yml`, and the API **seeds an empty database automatically** on first boot. The
only optional config is `mobile/.env` — and only when running the mobile app on a **physical
phone** (to point it at your computer's LAN IP; see §2).

---

## 1. Raise the backend stack (C++ + MongoDB + Express + web client)

From the **repository root**:

```bash
docker compose up --build
```

This builds and starts the three services defined in `docker-compose.yml`:

1. **`cpp-service`** — the EX2 C++ recommendation server on port `8080`.
2. **`mongo`** — a MongoDB 7 instance. It is **not** published to the host (avoids clashing
   with any local MongoDB) and its data lives in the named volume `mongo-data`, so it
   **survives restarts**. A healthcheck gates the `web` service so the API does not start
   until Mongo is actually accepting connections.
3. **`web`** — the Express API on port `3000`. On boot it connects to MongoDB through
   Mongoose, logs `Connected to MongoDB at …`, **seeds** the empty database with demo
   restaurants / menus / users / orders (idempotent — skipped if data already exists), and
   serves the built **React web client** from the same process.

Wait until the logs show the Mongo connection and seed completion.

<p align="center">
  <img width="746" alt="Terminal after docker compose up --build showing the three services up and the MongoDB connection + seed-complete log line" src="images/docker-compose-up.png" />
</p>

Once it is up:

- **Web client:** open **<http://localhost:3000>**
- **REST API:** available under **<http://localhost:3000/api>**

Here is the seeded Home screen in the web client:

<p align="center">
  <img width="1908" height="911" alt="Web Home screen with seeded restaurants" src="https://github.com/user-attachments/assets/bdecccd1-66aa-4050-812e-aa4514ef541c" />
</p>

---

## 2. Run the mobile client (React Native + Expo)

The mobile app is **not** containerized — run it with Expo after the backend is up. The
phone/emulator cannot reach the server over `localhost`, so the API base URL is configurable
via `EXPO_PUBLIC_API_URL` (see `mobile/src/config/api.js`).

```bash
cd mobile
npm install
npm run android      # or: npx expo start  → press a, or scan the QR in Expo Go
```

### Choosing the right base URL

`localhost` on a device points at the device itself, so the API URL depends on how you run
the app:

| Running the app on…          | `EXPO_PUBLIC_API_URL`                                       |
| ---------------------------- | ---------------------------------------------------------- |
| **Android emulator**         | *leave unset* → default `http://10.0.2.2:3000`             |
| **iOS simulator** (macOS)    | `http://localhost:3000`                                    |
| **Physical phone (Expo Go)** | `http://<YOUR-PC-LAN-IP>:3000` (e.g. `http://192.168.1.20:3000`) |

On the **Android emulator** a grader sets nothing — just `npm run android`.

For a **physical phone**, find your PC's LAN IP (`ipconfig` on Windows, `ipconfig getifaddr
en0` on macOS, `hostname -I` on Linux) and pass it when starting Expo:

```powershell
# Windows PowerShell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.20:3000"; npx expo start
```
```bash
# macOS / Linux / Git Bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
```

The value is baked in at startup, so **restart Expo** after changing it. If the phone can't
connect, check that it shares the **same Wi‑Fi** and that **port 3000** is allowed through the
firewall.

> See **`mobile/README.md`** for the `.env` file alternative, the WSL port-forward snippet,
> and a full troubleshooting table.

The mobile Home feed should list the same seeded restaurants as the web client:

<p align="center">
  <img width="300" alt="Mobile Home feed listing the seeded restaurants" src="images/mobile-home.png" />
</p>

> Do **not** commit `node_modules` — dependencies are installed locally only.

---

## 3. Verify the system is live

A quick end-to-end check that the documented commands actually work:

1. `docker compose up --build` — wait for the API to log its MongoDB connection and seed.
2. Open **<http://localhost:3000>** (web) and confirm the Home feed shows seeded restaurants.
3. Launch the mobile app and confirm its Home feed shows the same restaurants.
4. Log in or register on either client, then open a protected screen (Cart / Orders /
   Manage) to confirm JWT-backed auth works against the MongoDB-backed data.

Continue to **[Authentication Flows](Authentication-Flows.md)** and
**[CRUD Flows](CRUD-Flows.md)** for the full walkthroughs.

---

## 4. Teardown

```bash
docker compose down
```

The `mongo-data` volume persists, so a later `docker compose up` keeps your data. To wipe
the database as well:

```bash
docker compose down -v
```
