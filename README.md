# AdvancedWolt

AdvancedWolt is a multi-client food-delivery platform. A MongoDB-backed Express API serves a React web application and a React Native/Expo mobile application, while a C++ TCP service supplies product recommendations.

## Features

- JWT authentication and protected customer and owner flows
- Restaurant, menu, search, cart, and order management
- Persistent MongoDB storage with idempotent seed data
- Personalized recommendations through the C++ service
- React/Vite web client and Expo mobile client
- Docker Compose stack for the API, web application, recommender, and MongoDB

## Product walkthrough

The repository includes a small, maintained screenshot set for the mobile client and local stack. These images document the primary user journeys without replacing the detailed, step-by-step [wiki walkthroughs](wiki/Home.md).

| Authentication | Restaurant discovery | Search |
| --- | --- | --- |
| ![Mobile login](wiki/images/mobile-login.png) | ![Mobile home](wiki/images/mobile-home.png) | ![Mobile search](wiki/images/mobile-search.png) |

| Cart and checkout | Order status | Owner management |
| --- | --- | --- |
| ![Mobile cart and order](wiki/images/mobile-cart-order.png) | ![Mobile order status](wiki/images/mobile-order-status.png) | ![Manage restaurant](wiki/images/mobile-manage-edit-restaurant.png) |

The [environment setup guide](wiki/Environment-Setup.md) also includes a screenshot of the Docker Compose stack starting successfully.

## Architecture

```text
React web (client/) ─┐
Expo mobile (mobile/) ├─ HTTP/JSON + JWT ─> Express API (web/) ─> MongoDB
                      └───────────────────────> C++ recommender (src/, TCP :8080)
```

The web production bundle is built into the web container and served by Express. MongoDB data is stored in the `mongo-data` Compose volume. The mobile app runs separately through Expo and uses `EXPO_PUBLIC_API_URL`.

## Requirements

For the backend and web client, install Docker Desktop with Docker Compose v2. Mobile development additionally requires Node.js 20 or newer and Expo SDK 54 tooling (Expo Go or an Android/iOS runtime). Ports `3000` and `8080` must be available.

## Quick start

```bash
docker compose up --build
```

Open <http://localhost:3000>. The REST API is available under `/api`. Stop the stack with `Ctrl+C`, or run `docker compose down`.

To run the mobile client, keep the Compose stack running and use a second terminal:

```bash
cd mobile
npm install
npm run android        # or: npm run ios / npm run web
```

Android emulators use `http://10.0.2.2:3000` by default. For a physical device, set the computer's LAN address before starting Expo:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
```

## Configuration

The Compose stack supplies `PORT`, `MONGO_URI`, `CPP_SERVICE_HOST`, and `CPP_SERVICE_PORT` to the API. Local API configuration may use the same variables. Do not commit `.env` files or credentials. The mobile API URL is read from `EXPO_PUBLIC_API_URL`.

## Development commands

### C++ service

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --parallel
ctest --test-dir build --output-on-failure
```

### Express API

```bash
cd web
npm install
npm test
npm start
```

The API tests validate Mongoose schemas in memory and do not require MongoDB. `npm run seed` seeds a running database explicitly.

### React web client

```bash
cd client
npm install
npm run dev
npm run build
npm run preview
```

### Mobile client

```bash
cd mobile
npm install
npm start
```

The mobile package currently provides Expo start targets but no automated test or production build script.

## Testing and CI

Every pull request targeting `main` and pushes to `main` or `ci` run `.github/workflows/ci.yml`. It installs clean dependencies, builds and tests the C++ service, runs the API test suite, builds the web client, and validates mobile dependencies. Jobs use Node.js 20 and dependency caching where supported.

## Releases

Pushing a semantic version tag such as `v5.1.0`, or starting the **Release artifacts** workflow manually, builds the C++ service and React web client and uploads a tarball artifact. The workflow does not deploy to an external service or publish an image; deployment remains an operator-controlled Docker Compose step.

```bash
git tag v5.1.0
git push origin v5.1.0
```

## Repository structure

```text
src/       C++ TCP recommendation service
tests/     C++ unit tests
web/       Express REST API, Mongoose models, and API tests
client/    React/Vite web client
mobile/    React Native/Expo client
wiki/      Architecture and environment walkthroughs
```

## Troubleshooting

- If startup fails, confirm Docker is running and ports `3000` and `8080` are free.
- If MongoDB data is stale during local development, `docker compose down -v` removes the named data volume; the next start reseeds it.
- A physical phone must reach the host over the LAN; use the host LAN IP in `EXPO_PUBLIC_API_URL`, and allow port `3000` through the local firewall.
- For detailed screenshots and flow documentation, see the [wiki](wiki/Home.md), including [environment setup](wiki/Environment-Setup.md) and [architecture](wiki/Architecture-Overview.md).

## Contributing

Create a focused branch from `main`, make the smallest change that solves the issue, run the commands above, and open a pull request. Keep secrets and generated build output out of commits. Pull requests must pass the CI workflow before review.

## Security

Use strong, unique credentials for local accounts and keep JWT/database configuration out of source control. Report suspected vulnerabilities privately to the repository maintainers rather than opening a public issue with exploit details.

## License

This project is distributed under the [ISC license](https://opensource.org/license/isc-license-txt/).
