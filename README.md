# AdvancedWolt – Exercise 3: Food Delivery Web Server

This is **Exercise 3**: a small food‑delivery web server (Wolt style), written in
**Node.js + Express** with an **MVC** structure. It serves the API behind three
screens: sign‑up, login, and the main screen (restaurants, menus, orders, and
search).

When a request needs the recommendation / "viewed products" feature, the web
server connects to the **Exercise 2** C++ server over TCP and reuses it instead
of redoing that work.

> **This README is for Exercise 3.** The Exercise 2 write‑up (its SOLID answers)
> is in the [appendix](#appendix--exercise-2) at the bottom, and the Exercise 2
> code is frozen on the `ex2` branch.

Every `/api/*` route returns JSON, and all data is kept in memory, so restarting
the server clears it.

---

## Branches (for the checker)

| Branch | What's there |
| :--- | :--- |
| **`main`** | **Exercise 3** – this submission: the `web/` server plus the `src/` C++ server it talks to. |
| **`ex2`** | **Exercise 2** – frozen. To grade Exercise 2, check out this branch (`git checkout ex2`). |

Exercise 2 is locked on `ex2` and hasn't been touched since we submitted it, so
it stays gradable and our grace days are safe. We kept working on `main` for
Exercise 3. The C++ code still lives in `src/` on `main` because the web server
runs it as a dependency – it's the same code that's frozen on `ex2`.

---

## What it does

We only built the server side, not the actual screens. The API backs:

* **Sign‑up** – `POST /api/users` with username, password, name, phone, address.
* **Login** – `POST /api/tokens`, returns the user id if the credentials match.
* **Main screen** – list restaurants, open a menu, place and manage orders, and
  search.

Browsing is open to everyone. Actions that belong to a user (like placing an
order) need you to be "logged in", which in this exercise just means sending your
user id in a `user-id` header.

---

## How it's built (MVC)

```
HTTP / JSON client  (curl, Postman, or the app's screens)
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Express web server   ·   web/   ·   Exercise 3   ·   MVC             │
│                                                                      │
│   Routes ──▶ Middleware (auth) ──▶ Controllers ──▶ Models            │
│   url → fn     user-id header        HTTP logic       in‑memory data  │
└──────────────────────────────────────────────────────────────────────┘
        │   only for "viewed product" / recommendations
        ▼   TCP socket, newline‑delimited text
┌──────────────────────────────────────────────────────────────────────┐
│  C++ recommendation server   ·   src/   ·   Exercise 2               │
└──────────────────────────────────────────────────────────────────────┘
```

The code follows MVC and lives in `web/src`:

* **Routes** (`routes/`) match a URL and HTTP verb to a controller function.
* **Middleware** (`middleware/auth.js`) reads the `user-id` header. `requireAuth`
  blocks with **401** if it's missing; `attachUserId` makes it optional.
* **Controllers** (`controllers/`) are the HTTP layer: check the input, pick the
  status code, return JSON. No storage logic here.
* **Models** (`models/`) hold the in‑memory data and the rules (a product belongs
  to a restaurant, an order can only change while it's `pending`, passwords are
  saved only as a salted hash, and so on).
* **TCP client** (`services/tcpClient.js`) is the one file that knows about the
  Exercise 2 server. It opens a socket and speaks its text protocol; the address
  comes from `config/tcpConfig.js`.

**Talking to Exercise 2.** A few actions reuse the old server instead of redoing
it. When a logged‑in user opens a product (`GET .../products/:pId`), that view is
sent to the C++ server; creating an order does the same for the ordered items;
and recommendations are read back from there. Everything about Exercise 2 sits
behind that one small file, which keeps things loosely coupled.

---

## API reference

Base URL: `http://localhost:3000`. Bodies and responses are JSON. "Auth" means
the request must include a `user-id: <id>` header.

### Users & authentication
| Method | Path | Auth | Success | Errors |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/users` | – | `201 Created` + `Location` | `400` missing fields, `409` username taken |
| `GET`  | `/api/users/:id` | ✓ | `200 OK` (user details) | `404` not found |
| `POST` | `/api/tokens` | – | `200 OK` (`{ userId }`) | `400` missing fields, `404` bad credentials |

### Restaurants
| Method | Path | Auth | Success | Errors |
| :--- | :--- | :---: | :--- | :--- |
| `GET`    | `/api/restaurants` | – | `200 OK` (array) | – |
| `POST`   | `/api/restaurants` | – | `201 Created` + `Location` | `400` name required |
| `GET`    | `/api/restaurants/:id` | – | `200 OK` | `404` not found |
| `PATCH`  | `/api/restaurants/:id` | – | `200 OK` (updated) | `400` name required, `404` not found |
| `DELETE` | `/api/restaurants/:id` | – | `204 No Content` | `404` not found |

### Products (a restaurant's menu)
| Method | Path | Auth | Success | Errors |
| :--- | :--- | :---: | :--- | :--- |
| `GET`    | `/api/restaurants/:id/products` | – | `200 OK` (array) | `404` restaurant not found |
| `POST`   | `/api/restaurants/:id/products` | – | `201 Created` + `Location` | `400`/`404` |
| `GET`    | `/api/restaurants/:id/products/:pId` | optional | `200 OK` (records a **view** if `user-id` is sent) | `404` |
| `PATCH`  | `/api/restaurants/:id/products/:pId` | – | `204 No Content` | `400`/`404` |
| `DELETE` | `/api/restaurants/:id/products/:pId` | – | `204 No Content` | `404` |

### Orders
| Method | Path | Auth | Success | Errors |
| :--- | :--- | :---: | :--- | :--- |
| `POST`   | `/api/orders` | ✓ | `201 Created` + `Location` | `400` invalid items, `404` restaurant |
| `GET`    | `/api/orders` | ✓ | `200 OK` (current user's orders) | – |
| `GET`    | `/api/orders/:id` | ✓ | `200 OK` | `404` not found |
| `PATCH`  | `/api/orders/:id` | ✓ | `204 No Content` | `400` invalid status/items, `404` |
| `DELETE` | `/api/orders/:id` | ✓ | `204 No Content` | `400` non‑pending, `404` |

### Search
| Method | Path | Auth | Success |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/search/:query` | – | `200 OK` – `{ restaurants, products }` whose name or description contains `:query` |

**Statuses used:** `200` ok, `201` created (+`Location`), `204` no content,
`400` bad request, `401` auth required, `404` not found, `409` conflict.

---

## Running it

Both servers run as separate containers, the way the exercise asks. The easiest
way is Docker Compose.

### Option A – Docker Compose (easiest)

From the repo root:

```bash
docker compose up --build
```

This starts two containers:

* **`cpp-service`** – the Exercise 2 C++ server on port **8080**.
* **`web`** – the Express API on port **3000**. It finds the C++ server through
  the `CPP_SERVICE_HOST` / `CPP_SERVICE_PORT` env vars.

<p align="center">
  <img src="docs/screenshots/00-startup.png" alt="docker compose up — both servers start" width="92%">
</p>

The API is now at `http://localhost:3000`.

### Option B – run the two containers yourself

```bash
# Exercise 2 C++ server on 8080
docker build -t wolt-cpp .
docker run --rm -p 8080:8080 wolt-cpp 8080

# Express web server on 3000 (point it at the C++ server)
docker build -t wolt-web ./web
docker run --rm -p 3000:3000 \
  -e CPP_SERVICE_HOST=host.docker.internal -e CPP_SERVICE_PORT=8080 \
  wolt-web
```

### Option C – web server with Node

```bash
# 1) start the C++ server (Docker, as above, on 8080)
# 2) then:
cd web
npm install
CPP_SERVICE_HOST=127.0.0.1 CPP_SERVICE_PORT=8080 PORT=3000 npm start
```

Most endpoints (restaurants, search, sign‑up) work even when the C++ server is
down. Only the view and recommendation paths need it.

---

## Demo

The screenshots below are real terminal sessions against the running stack,
captured with `curl -i` so you can see the status line and headers. The ids in
the output are the real UUIDs the server generated; the commands reuse them with
shell variables (`$RID`, `$PID`, `$UID`, `$OID`).

### Restaurants and menu

First, the exact flow from the assignment's appendix: an empty list, create a
restaurant (`201` + `Location`), then list again. After that: one restaurant, a
couple of error cases, adding a product, and the Exercise 2 bridge – a logged‑in
user opening a product, which gets recorded on the C++ server.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/01-restaurants.png" alt="GET empty list, POST a restaurant, GET the list again"></td>
    <td width="50%"><img src="docs/screenshots/02-restaurant-get.png" alt="GET one restaurant, PATCH unknown id 404, POST empty body 400"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/03-products.png" alt="POST a product to the menu, GET the menu"></td>
    <td width="50%"><img src="docs/screenshots/04-product-view.png" alt="GET a product as a logged-in user records the view on the C++ server"></td>
  </tr>
</table>

> The bottom‑right shot shows the cross‑server part working: after the logged‑in
> `GET`, the view appears in the C++ server's file (`data/views.txt`) as
> `<userId> <productId>`.

### Sign up, log in, order and search

Register a user, log in (plus a failed login), create and update an order while
logged in (with a `401` when the `user-id` header is missing), and a search that
matches both a restaurant and a product.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/05-register.png" alt="POST /api/users to register"></td>
    <td width="50%"><img src="docs/screenshots/06-login.png" alt="POST /api/tokens login success and failure"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/07-orders.png" alt="create order, 401 without auth, list orders, patch order status"></td>
    <td width="50%"><img src="docs/screenshots/08-search.png" alt="GET /api/search/:query"></td>
  </tr>
</table>

---

## Tests

```bash
# Web tests (Node's built-in test runner, needs Node 18+)
cd web
npm install
npm test
```

```bash
# Exercise 2 C++ unit tests, inside the image
docker build -t wolt-cpp .
docker run --rm --entrypoint ./build/tests/unit_tests wolt-cpp
```

---

## Security note

This is a course exercise, so don't store or send real passwords, credit cards,
API keys, or anything sensitive. Passwords here are only ever kept as a salted
PBKDF2 hash, and the API never returns them.

---

# Appendix – Exercise 2

These questions are from **Exercise 2**. The answers are kept here as they were
(and also live on the `ex2` branch) so they're easy to find.

### 1. Command names changed (add → POST, recommend → GET)
**Did it require touching closed code?**
Yes, in ex1 command names were hardcoded strings scattered across `AppInternals`
dispatch logic. There was no registry abstraction.

**Fix applied (ex2):** `CommandManager` holds a
`std::unordered_map<std::string, ICommand*>` registry. The dispatcher never
mentions a command name, it just looks up the key and forwards. Renaming a
command is a single string change at the registration site (e.g. `app.cpp`).
`CommandParser` lowercases the verb before lookup, so case sensitivity is
handled in one place too. The dispatcher is now genuinely closed to this change.

### 2. New commands added (PATCH, DELETE)
**Did it require touching closed code?**
No. Each new command is a self-contained class implementing `ICommand`:
```cpp
virtual models::Response execute(const models::ParsedCommand& cmd,
                                  IdbManager& db) = 0;
```
Registration is one line per command at startup. `CommandManager::dispatch`
and all existing commands are untouched. `HelpCommand` queries the
`CommandManager` registry dynamically, new commands appear in `help` output
automatically with zero changes to `HelpCommand` itself.
This is the Open/Closed Principle working as intended.

### 3. Command output format changed
**Did it require touching closed code?**
Partially. In ex1 commands returned raw strings and each command owned its
own formatting. There was no shared wire-format abstraction.

**Fix applied (ex2):** The new `models::Response` class with a `toWire()`
method centralizes all wire serialization. Commands return a semantic
`Response` object, not a raw string. Changing how a status serializes to wire bytes now means
touching only `Response::toWire()`, not every command that produces
that status. The `models::Status` enum + lookup table further ensure that
adding or renaming a status phrase is a single-line change.

### 4. I/O moved from console to TCP sockets
**Did it require touching closed code?**
No. This was the cleanest boundary in the design. Commands operate on
`ParsedCommand` structs and return `Response` objects, they have
zero knowledge of transport. The server loop in `main.cpp` owns the
socket, reads a line, calls `CommandParser` -> `CommandManager`, then
writes `response.toWire()` to the file descriptor. Switching from
`std::cin`/`std::cout` to a socket touched only `main.cpp`.

**Architecture overview:**
```
[socket fd]
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  CommandParser                                       │
│  raw bytes → ParsedCommand                          │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  CommandManager                                      │
│  registry lookup → dispatch                         │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  ICommand::execute()                                 │
│  command logic only                                 │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  IdbManager                                          │
│  abstraction layer for the database                 │
└─────────────────────────────────────────────────────┘
```

Each layer is replaceable independently. In ex1, `App` + `AppInternals`
collapsed several of these layers together, which is why the socket
migration required no surgery on command or DB code, those layers
were already properly separated by ex2.
