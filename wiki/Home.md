# AdvancedWolt — Project Wiki

Welcome to the AdvancedWolt wiki. This is the grader-facing walkthrough for **building and
running the entire system** and exercising its main flows on **both** clients (web and
mobile), with screenshots.

The project is a Wolt-inspired food-delivery system built across the course exercises:

- **EX2** — a C++ TCP recommendation server (`src/`).
- **EX3** — a Node.js + Express REST API persisted in **MongoDB** via Mongoose (`web/`).
- **EX4** — a **React** web client (`client/`), served by the Express server.
- **EX5** — a **React Native (Expo)** mobile client (`mobile/`).

---

## Table of contents

1. **[Environment Setup](Environment-Setup.md)** — raise the whole stack with
   `docker-compose` and run both the web and mobile clients (ordered commands + screenshots).
2. **[Authentication Flows](Authentication-Flows.md)** — register and login on web and
   mobile, including field validation and error states.
3. **[CRUD Flows](CRUD-Flows.md)** — create / edit / delete restaurants, dishes, and orders
   on both clients.

---

## System architecture

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
│  Express Web Server   ·   web/   ·   EX3   ·   Node.js                │
│   (Validation, Routing, JWT, MongoDB via Mongoose)                   │
└───────────┬─────────────────────────────────────┬────────────────────┘
            │  TCP socket (newline-delimited)      │  Mongoose
            ▼                                      ▼
┌───────────────────────────────┐   ┌──────────────────────────────────┐
│  C++ Recommendation Server    │   │  MongoDB                         │
│  src/ · EX2 · :8080           │   │  mongo:27017 (internal)          │
└───────────────────────────────┘   └──────────────────────────────────┘
```

Both clients talk to the **same** Express API — no mock data; every screen reads live from
MongoDB. The web client is built into the Express image and served from the same process,
while the mobile client runs through Expo and points at the API via `EXPO_PUBLIC_API_URL`.

## Components & ports

| Component        | Path       | Exercise | Port                     | How it runs                         |
| ---------------- | ---------- | -------- | ------------------------ | ----------------------------------- |
| C++ recommender  | `src/`     | EX2      | `8080`                   | `docker compose` (`cpp-service`)    |
| Express API      | `web/`     | EX3      | `3000` (host)            | `docker compose` (`web`)            |
| MongoDB          | —          | EX5      | `27017` (internal only)  | `docker compose` (`mongo`)          |
| Web client       | `client/`  | EX4      | served at `3000`         | built into the `web` image          |
| Mobile client    | `mobile/`  | EX5      | Expo / device            | `npm run android` / `npx expo start`|

For full, copy-pasteable run instructions start with **[Environment Setup](Environment-Setup.md)**.
