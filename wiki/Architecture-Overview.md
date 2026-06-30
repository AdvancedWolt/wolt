# Architecture Overview

How the AdvancedWolt system fits together: the components, how a request flows through them,
and where each exercise lives.

> ⬅ Back to the [wiki home](Home.md).

---

## The big picture

AdvancedWolt is a **multi-client** food-delivery system built across the course exercises. Two
*thin* clients — a **React web app** and a **React Native (Expo) mobile app** — talk to **one**
Express REST API. The API holds no business data itself: it persists everything to **MongoDB**
and consults a **C++ TCP recommendation server** for "you might also like" suggestions.

There is **no mock data** anywhere. Every screen on both clients reads and writes live through
the same API.

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

---

## Components

| Component         | Path       | Exercise | Port                    | Role                                                          |
| ----------------- | ---------- | -------- | ----------------------- | ------------------------------------------------------------- |
| C++ recommender   | `src/`     | EX2      | `8080`                  | TCP service that logs product views and returns suggestions.  |
| Express REST API  | `web/`     | EX3      | `3000` (host)           | Single backend: validation, JWT auth, MongoDB persistence.    |
| Web client        | `client/`  | EX4      | served at `3000`        | React SPA, built into and served by the Express image.        |
| Mobile client     | `mobile/`  | EX5      | Expo / device           | React Native (Expo) app against the same API.                 |
| MongoDB           | —          | EX5      | `27017` (internal only) | Document store via Mongoose; data persists in a Docker volume.|

The first three plus MongoDB run together under **Docker Compose**; the mobile client runs
separately through **Expo** and points at the API via `EXPO_PUBLIC_API_URL`. See
[Environment Setup](Environment-Setup.md) for the exact commands.

---

## Request & data flow

A typical authenticated action follows the same path from either client:

1. **Client → API.** The client sends an HTTP request with a **JWT** in the `Authorization`
   header (managed by `AuthContext` on web, `AuthContext` + AsyncStorage on mobile).
2. **Auth & validation.** Express middleware verifies the token and validates the request body
   before any handler runs.
3. **API → MongoDB.** Controllers read and write through **Mongoose models**
   (`web/src/models/*`, backed by schemas in `web/src/models/schemas/`). Nothing is kept in
   in-memory arrays.
4. **API → C++ recommender.** When a dish is viewed, the API opens a **TCP socket**
   (`web/src/services/tcpClient.js`) to the C++ server to log the view and fetch related
   dishes.
5. **Recommendations surface in the cart.** Those related dishes appear as **"you might also
   like"** when the user opens their cart — on both web and mobile.

---

## Persistence (MongoDB / Mongoose)

* The connection is centralized in one reusable module, **`web/src/config/db.js`**, imported by
  every model. The URI comes from **`MONGO_URI`** in the environment, so **no connection string
  or secret is ever committed**.
* Docker Compose sets `MONGO_URI=mongodb://mongo:27017/wolt`; outside Docker it defaults to
  `mongodb://localhost:27017/wolt`. MongoDB is **not** published to the host (no port clashes),
  and its data lives in the named volume `mongo-data`, so it **survives restarts**.
* On boot the API connects, logs `Connected to MongoDB at …`, **fails fast** if Mongo is
  unreachable, and **seeds** an empty database (idempotent — skipped when data already exists).

---

## Authentication

* **JWT-based.** Registering/logging in returns a token the client stores and attaches to every
  protected request.
* **Shared validation.** The same field rules run on the client (`utils/validators.js` in both
  `client/` and `mobile/`) and again on the server, so bad input is rejected consistently.
* **Route/screen protection.** Browsing restaurants and menus is public; the cart, orders and
  management are gated — `ProtectedRoute` on web, `ProtectedScreen` on mobile. **Manage** is
  further restricted to `restaurant_owner` accounts.

See [Authentication Flows](Authentication-Flows.md) for the screenshot walkthrough.

---

## Two clients, one API

Both clients are deliberately thin and feature-equivalent:

| Concern            | Web (`client/`)                       | Mobile (`mobile/`)                                  |
| ------------------ | ------------------------------------- | --------------------------------------------------- |
| Framework          | React (SPA, React Router)             | React Native + Expo (React Navigation)              |
| Navigation         | Top **navbar** + routes               | **Drawer** over a native stack                      |
| State              | `Auth` / `Theme` / `Cart` contexts    | Same contexts, persisted with **AsyncStorage**      |
| API base URL       | same-origin (served by Express)       | configurable `EXPO_PUBLIC_API_URL`                  |
| Auth guard         | `ProtectedRoute`                      | `ProtectedScreen`                                   |

Every feature — auth, discovery (Near you / Promoted / per-category), restaurant menus, search,
cart with recommendations, checkout, orders & order detail, profile management, and dark/light
theming — exists on **both**. The [CRUD Flows](CRUD-Flows.md) page demonstrates the
create/edit/delete flows on each client.

---

Continue to **[Environment Setup](Environment-Setup.md)** to bring the whole stack up, or back
to the **[wiki home](Home.md)**.
