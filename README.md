# AdvancedWolt – Exercise 5: Mobile Client & Persistent Data

This is **Exercise 5**: a full-stack, **multi-client** food-delivery system. It extends the
Exercise 4 React web app with two major additions:

* **Persistent storage (MongoDB).** The Express API now stores everything in **MongoDB** via
  **Mongoose** instead of in-memory arrays, so restaurants, menus, users and orders survive
  restarts. Data lives in a Docker volume and is seeded automatically on first boot.
* **A native mobile client (React Native + Expo).** A new `mobile/` app talks to the **same**
  Express API as the web client, with **full feature parity** — authentication, restaurant
  discovery, search, cart, orders, and restaurant-owner management.

It builds on the earlier exercises: the **C++ TCP recommendation server (Exercise 2)** powers
"you might also like" suggestions, and the **Node.js + Express REST API (Exercise 3)** is the
single backend serving both clients.

The assignment is split into two parts:
* **Part A:** Agile project management using JIRA.
* **Part B:** The multi-client architecture — a MongoDB-backed Express API serving a React web
  client and a React Native mobile client, with JWT authentication and live (no-mock) data.

> 📖 **Full build & run walkthrough with screenshots** — see the **[Wiki](wiki/Home.md)**:
> [Architecture Overview](wiki/Architecture-Overview.md),
> [Environment Setup](wiki/Environment-Setup.md) (raise everything with `docker-compose` and
> run **both** the web and mobile clients), [Authentication Flows](wiki/Authentication-Flows.md),
> and [CRUD Flows](wiki/CRUD-Flows.md).

---

## Part A: Agile Workflow (JIRA & GitHub) — *How we worked*

The development process was strictly managed via JIRA and synchronized with GitHub, adhering to Agile principles:

* **Epics & User Stories:** The application was divided into logical epics (e.g., Authentication, Ordering, UI/UX) containing specific user stories and actionable tasks.
* **Sprints & Scrum:** The work was organized into sprints. A Scrum Master was appointed to guide sprint planning, and regular status meetings were held (and documented) at least twice a week.
* **Workflow Statuses:** Issues moved through `To Do`, `In Progress`, `Code Review`, and `Done`. Tasks were assigned to members before work began.
* **Blocked Tasks:** Dependencies were explicitly tracked using the `blocked by` link type in JIRA.
* **Feature Branches & Pull Requests:** Every task was developed on a dedicated feature branch named after the JIRA issue (e.g., `AW-12-login-page`). Code was merged to the main branch strictly via Pull Requests, which required approval from other team members before merging. The Jira-GitHub integration automatically linked PRs and branches to their respective JIRA issues.

**In short:** we plan each task in JIRA (epic → user story → task, assigned to an owner
before work starts) → branch off `main` as `AW-<issue>-<slug>` → open a Pull Request, which
moves the issue to **Code Review** → a *different* team member reviews and approves → merge to
`main` moves the issue to **Done**. Blocking dependencies are tracked with JIRA's `blocked by`
links, and branch/PR names embed the issue key so JIRA links them automatically.

---

## Part B: System Architecture

The platform is built from **four cooperating components**. Both clients are *thin* — they
hold no mock data; every screen reads and writes live through the same Express REST API, which
persists to MongoDB and consults the C++ recommender. The web client is built into the Express
image and served from the same process; the mobile client runs through Expo and points at the
API via `EXPO_PUBLIC_API_URL`.

```text
┌─────────────────────────┐        ┌─────────────────────────┐
│  Web client (React)     │        │  Mobile client          │
│  client/ · EX4          │        │  React Native + Expo    │
│  served at :3000        │        │  mobile/ · EX5          │
└───────────┬─────────────┘        └───────────┬─────────────┘
            │  HTTP (JSON + JWT Auth)           │
            └─────────────────┬─────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Express REST API   ·   web/   ·   EX3   ·   Node.js                  │
│   (Validation, Routing, JWT auth, MongoDB via Mongoose)              │
└───────────┬─────────────────────────────────────┬────────────────────┘
            │  TCP socket (newline-delimited)      │  Mongoose
            ▼                                      ▼
┌───────────────────────────────┐   ┌──────────────────────────────────┐
│  C++ Recommendation Server    │   │  MongoDB                         │
│  src/ · EX2 · :8080           │   │  mongo:27017 (internal)          │
└───────────────────────────────┘   └──────────────────────────────────┘
```

| Component         | Path       | Exercise | Role                                                         |
| ----------------- | ---------- | -------- | ------------------------------------------------------------ |
| C++ recommender   | `src/`     | EX2      | TCP service that logs product views and returns suggestions. |
| Express REST API  | `web/`     | EX3      | Single backend: validation, JWT auth, MongoDB persistence.   |
| Web client        | `client/`  | EX4      | React SPA, built into and served by the Express image.       |
| Mobile client     | `mobile/`  | EX5      | React Native (Expo) app against the same API.                |
| MongoDB           | —          | EX5      | Document store (Mongoose); data persists in a Docker volume. |

The data flow is the same for both clients: a client sends an authenticated HTTP request → the
Express API validates it and reads/writes MongoDB through Mongoose → when a dish is viewed, the
API opens a TCP socket to the C++ recommender to log the view and fetch related dishes, which
then surface as "you might also like" in the cart.

### Repository Layout

```text
src/        EX2 · C++ TCP recommendation server
web/        EX3 · Node.js + Express REST API (Mongoose, JWT, seed) — also serves the built web client
client/     EX4 · React web client (SPA)
mobile/     EX5 · React Native (Expo) mobile client
```

#### Backend — `web/src/`

* **`controllers/`** + **`routes/`** — the REST API (restaurants, products, users, tokens,
  orders, search, recommendations).
* **`models/`** + **`models/schemas/`** — Mongoose models and the schemas that validate them.
* **`config/db.js`** — the single, reusable MongoDB connection module every model imports.
* **`services/tcpClient.js`** — the TCP client that talks to the C++ recommender (EX2).
* **`middleware/`** — JWT authentication and request validation.
* **`seed.js`** / **`seedScript.js`** — idempotent demo-data seeding (boot-time and standalone).

#### Web client — `client/src/`

* **`pages/`** — route views: `Login` / `Register`, `Home`, `RestaurantDetail`, `Search`,
  `Manage` / `ManageAccount`, `Cart` / `Orders` / `OrderDetail`.
* **`components/`** — reusable UI (`Navbar`, `RestaurantCard`, `MenuItem`, `CartLine`, …).
* **`context/`** — `AuthContext` (JWT + user), `ThemeContext` (dark/light), `CartContext`.
* **`routes/`** — `ProtectedRoute` guards for authenticated-only pages.

#### Mobile client — `mobile/src/`

A React Native (Expo) app that mirrors the web client against the same API. The drawer is the
phone's take on the web navbar.

* **`screens/`** — `Login` / `Register`, `Home`, `Restaurant`, `Search`, `Cart`,
  `Orders` / `OrderDetail`, `Manage`, `Account`.
* **`navigation/`** — a drawer over a native stack, with `ProtectedScreen` guards mirroring the
  web's `ProtectedRoute`.
* **`context/`** — the same `Auth` / `Theme` / `Cart` providers, persisted with AsyncStorage.
* **`api/`** + **`config/api.js`** — the fetch wrapper and the single configurable backend URL
  (`EXPO_PUBLIC_API_URL`).

### Features & In-Depth GUI Walkthrough

The screenshots below are from the **web client**. Every feature also ships on the **mobile
client** with the same behavior — see the **[Wiki](wiki/Home.md)** for the mobile,
screenshot-backed walkthroughs of each flow.

1. **Authentication (JWT) & Registration**
   * **Sign Up:** Users can register an account by providing a unique username, secure password (requiring at least 8 characters, letters, and digits), a display name, geographic location (X/Y coordinates), and an optional profile image (up to 5MB). The UI features a dynamic image preview and real-time form validation.
   * **Login:** Registered users can log in to receive a JWT. The application securely manages this token in the `AuthContext`.
   * **Route Protection:** Unauthenticated users can browse restaurants and menus, but attempting to access the shopping cart or order history will automatically redirect them to the Login page.
   <p align="center">
     <em><img width="1875" height="907" alt="image" src="https://github.com/user-attachments/assets/8a099b76-3498-4846-add0-071e355da833" />
<img width="1907" height="906" alt="image" src="https://github.com/user-attachments/assets/904d5d00-3d1d-4f3d-be3b-aef0c740e1f0" />
<img width="1902" height="881" alt="image" src="https://github.com/user-attachments/assets/aabdb541-df9b-4684-af88-fd39f55901e3" />
</em>
   </p>

2. **Home Screen (Restaurant Discovery)**
   * **Personalized View:** Upon logging in, the Navbar updates to display the user's name and profile image.
   * **Restaurant Listing:** The main dashboard fetches data from the Express backend and displays restaurant cards, distinguishing between "Nearby" and "Promoted" locations.
   * **Responsive Design:** Wolt-inspired cards with smooth hover effects and responsive grids.
   <p align="center">
     <em> <img width="1908" height="911" alt="image" src="https://github.com/user-attachments/assets/bdecccd1-66aa-4050-812e-aa4514ef541c" />
</em>
   </p>

3. **Restaurant Menus & Recommendations**
   * **Full Menu:** Clicking a restaurant opens its dedicated page, displaying a grid of available products (dishes) with their prices and descriptions.
   * **Smart Recommendations:** When a user views a product, the Node.js server seamlessly communicates with the C++ TCP server (from Exercise 2) to log the view and fetch personalized "Users also viewed" recommendations, which are displayed dynamically on the page.
   <p align="center">
     <em><img width="1898" height="908" alt="image" src="https://github.com/user-attachments/assets/5f85e698-c0d0-46bb-a8dd-1d9ff2485c94" />
     <img width="1878" height="790" alt="image" src="https://github.com/user-attachments/assets/8e02342b-2977-43f6-b945-083e3c37acbb" />
</em>
   </p>

4. **Shopping Cart & Checkout**
   * **Cart Management:** Users can add multiple products from a restaurant to their shopping cart. A persistent cart context tracks the selected items.
   * **Real-time Totals:** The cart instantly recalculates sub-totals and allows the user to increment, decrement, or remove items before proceeding to checkout.
   * **Placing Orders:** A single click sends the order payload to the backend, which creates a new pending order attached to the user's account.
   <img width="1902" height="922" alt="image" src="https://github.com/user-attachments/assets/8aed6898-e186-4fe3-9964-5e0271b4177b" />

5. **Order Management & History**
   * **Tracking Orders:** The "My Orders" dashboard allows logged-in users to review all their past and active orders.
   * **Order Details & Status Updates:** Users can view the itemized receipt for any specific order and change its status (e.g., from `pending` to `completed`) using a simple, intuitive interface that PATCHes the backend.
   <p align="center">
     <em><img width="1896" height="897" alt="image" src="https://github.com/user-attachments/assets/2f6410ad-f7d7-4100-8e8c-9d007032110e" />
</em>
   </p>

6. **Search Functionality**
   * **Global Search:** A dedicated search bar in the Navbar allows users to query the entire platform.
   * **Granular Results:** The search results page dynamically categorizes matches, showing matching restaurants alongside individual dishes whose name or description contains the query.
   <p align="center">
     <em><img width="1906" height="897" alt="image" src="https://github.com/user-attachments/assets/b99b082d-3bdb-45c3-b314-42e6443465a1" />
</em>
   </p>

7. **Dynamic Theming (Light/Dark Mode)**
   * **Instant Switch:** The Navbar includes a moon/sun toggle icon that instantly switches the application between `light mode` and `dark mode`. 
   * **Global Application:** This toggles CSS variables globally across all components, instantly re-coloring backgrounds, text, and borders for a comfortable viewing experience without reloading the page.
   <p align="center">
     <em><img width="1906" height="898" alt="image" src="https://github.com/user-attachments/assets/104ab69e-17bc-4ef5-8456-406290930cef" />
</em>
   </p>

8. **Mobile client (React Native + Expo) — full feature parity**
   * All of the above flows — JWT auth & registration, restaurant discovery (Near you /
     Promoted / per-category), restaurant menus, **cart with C++-powered recommendations**,
     checkout, orders & order detail, global search, profile management, and dark/light theming
     — are reimplemented natively in `mobile/`.
   * The drawer replaces the web navbar; owner-only **Manage** is gated to restaurant owners;
     state and auth persist across restarts via AsyncStorage.
   * **Screenshot walkthroughs for the mobile client live in the
     [Wiki](wiki/Home.md):** [Environment Setup](wiki/Environment-Setup.md),
     [Authentication Flows](wiki/Authentication-Flows.md), and [CRUD Flows](wiki/CRUD-Flows.md).

---

## Running the Application

The entire stack is containerized using Docker Compose.

### Prerequisites (short version)

- **Docker Desktop** with **Compose v2** (the `docker compose` command) — the only thing needed
  for the backend + web client. No local Node, C++ compiler, or MongoDB required.
- **Node.js 20 LTS+** and a mobile runtime — *only* if you run the mobile app. Easiest is a
  phone with the **Expo Go** app (supporting **Expo SDK 54**); an **Android emulator** also
  works. Pinned toolchain: Node 20, MongoDB 7, Expo SDK 54, React Native 0.81, React 19.
- Host ports **3000** and **8080** must be free (MongoDB's 27017 stays internal). No `.env` or
  secrets are needed for the backend.

> 📋 **Full, bulletproof prerequisites** — exact versions, toolchain verification commands, and
> the two mobile-runtime paths — are in the
> **[Wiki → Environment Setup](wiki/Environment-Setup.md#0-prerequisites)**.

### Running the full system (web **and** mobile) — TL;DR

There are **two clients** against one backend. Run them in this order:

```bash
# 1) Backend + web client (C++ recommender, MongoDB, Express API, built React web app)
#    From the repo root:
docker compose up --build
#    → Web client:  http://localhost:3000
#    → REST API:    http://localhost:3000/api

# 2) Mobile client (React Native + Expo) — in a second terminal, after the backend is up:
cd mobile
npm install
npm run android        # or: npx expo start  → press a, or scan the QR in Expo Go
```

The mobile app reads the API base URL from `EXPO_PUBLIC_API_URL`, defaulting to
`http://10.0.2.2:3000` (Android emulator → host). For a **physical phone**, point it at your
computer's LAN IP, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start`.

The detailed, screenshot-backed version of this is in the
**[Wiki → Environment Setup](wiki/Environment-Setup.md)**.

### Quick Start (Docker Compose)

From the root of the project, run:

```bash
docker compose up --build
```

<p align="center">
  <em><img width="746" height="527" alt="image" src="https://github.com/user-attachments/assets/6495bf84-c938-4bb3-8655-76af5beecc5d" />
</em>
</p>

This starts the backend stack:
1. **`cpp-service`**: The Exercise 2 C++ server on port 8080.
2. **`mongo`**: A MongoDB instance available to the other Compose services as
   `mongo:27017`. Its data is stored in the named Docker volume `mongo-data`,
   so it **survives container restarts** (`docker compose down` followed by
   `docker compose up` keeps your data). MongoDB is not published to the host,
   which avoids conflicts with any local MongoDB already using port 27017.
3. **`web`**: The Express API backend on port 3000. It connects to MongoDB through Mongoose on boot, seeds an empty database, and serves the built React web client from the same process.

Once the containers are running, open your browser to:
**[http://localhost:3000](http://localhost:3000)**

API endpoints are available under **[http://localhost:3000/api](http://localhost:3000/api)**.

### Mobile app against the Docker stack

The mobile app is not containerized; run it with Expo after the stack above is
up. The app reads the API base URL from `EXPO_PUBLIC_API_URL`, defaulting to
`http://10.0.2.2:3000` for the Android emulator.

```bash
cd mobile
npm install
npm run android
```

For a physical device, point Expo at the host machine's LAN IP:

```bash
EXPO_PUBLIC_API_URL=http://<your-computer-lan-ip>:3000 npx expo start
```

Keep `node_modules` local; it is intentionally ignored and must not be
committed. A minimal end-to-end smoke check is:

1. Run `docker compose up --build` and wait for the API to log its MongoDB
   connection and seed completion.
2. Launch the mobile app with the base URL pointing at the API.
3. Confirm the Home feed shows seeded restaurants.
4. Log in or register, then open a protected screen to confirm JWT-backed auth
   works against MongoDB-backed data.

### Database connection (MongoDB / Mongoose)

The Node server persists data in MongoDB. The connection is centralized in a single
reusable module, **`web/src/config/db.js`**, which every Mongoose model imports.

* **`MONGO_URI`** — the connection string, read from the environment so **no
  connection string or secret is ever committed**. Docker Compose sets it to
  `mongodb://mongo:27017/wolt`. When running the server outside Docker it defaults to
  `mongodb://localhost:27017/wolt`. The default URI carries no credentials.
* On boot the server connects via Mongoose, logs `Connected to MongoDB at …`, and
  **fails fast** (logs a readable error and exits) if MongoDB is unreachable.

Every controller reads and writes through Mongoose models (`web/src/models/*.js`,
backed by the schemas in `web/src/models/schemas/`); no data is kept in in-memory
arrays. The HTTP API is unchanged — the same response bodies and status codes the
EX4 web client and the mobile app expect.

### Seeding the database

On boot the server seeds an empty database with demo restaurants, menus, users and
orders (the seed is idempotent: it skips when restaurants already exist, so data in
the `mongo-data` volume is never duplicated). To seed a fresh database without
starting the API, run the standalone script:

```bash
cd web
npm install
npm run seed   # connects to MONGO_URI, seeds if empty, then exits
```

### Demo accounts (for graders)

The seed creates ready-to-use logins, so you can exercise every flow without
registering. **No setup beyond `docker compose up` is required** — these exist as
soon as the database is seeded.

| Role             | Username                                | Password    | What you can do                                                                                      |
| ---------------- | --------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| Restaurant owner | `wolt-partners`                         | `Partners1` | Owns **all seeded restaurants** — open **Manage** to create, edit and delete restaurants and dishes. |
| Customer         | `noa` (also `amir`, `maya`, `daniel`, …) | `Password1` | Browse, search, add to cart, place and manage orders.                                                |

> **To test restaurant management** (web *or* mobile), log in as
> **`wolt-partners` / `Partners1`**. It owns the entire seeded catalog, so the
> **Manage** screen opens pre-filled and ready to edit. On **mobile**, the
> **Manage** drawer item only appears for restaurant owners. You can also register
> a new **Restaurant owner** account to see the create-from-empty flow.

### Tests

```bash
cd web
npm install
npm test       # runs the Mongoose schema validation tests (no database required)
```

The schema tests (`web/tests/models.test.js`) validate the domain models in memory
via `validateSync()` and need no MongoDB connection. End-to-end CRUD is verified
against the running stack — bring the system up with `docker compose up` and use
`tests.ps1` (an HTTP smoke script against `http://localhost:3000`).


