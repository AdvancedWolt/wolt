# Wolt Recommendation System

A product recommendation engine implemented as a Client-Server architecture over TCP. The system allows users to track viewed products and receive suggestions based on similar user behavior.

## Checking the exercise
The exercise solution is saved in the branch called **'ex2'**.

---
## Design & Extensibility Questions (SOLID Reflection)

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

---

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

---

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

---

### 4. I/O moved from console to TCP sockets
**Did it require touching closed code?**
No. This was the cleanest boundary in the design. Commands operate on
`ParsedCommand` structs and return `Response` objects, they have
zero knowledge of transport. The server loop in `main.cpp` owns the
socket, reads a line, calls `CommandParser` -> `CommandManager`, then
writes `response.toWire()` to the file descriptor. Switching from
`std::cin`/`std::cout` to a socket touched only `main.cpp`.

---

Architecture overview:
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


# Pictures of the Program

## Build Process
<img width="811" height="397" alt="image" src="https://github.com/user-attachments/assets/f0805e5f-af15-4bca-993d-f86aa74dbe74" />

## Test Results
<img width="1167" height="831" alt="image" src="https://github.com/user-attachments/assets/386c670e-af5d-414b-a64a-f37205811a89" />
<img width="962" height="836" alt="image" src="https://github.com/user-attachments/assets/a0b1f581-1f56-466c-b298-a3e53beb3485" />
<img width="973" height="837" alt="image" src="https://github.com/user-attachments/assets/b361c374-e005-41bb-80cf-98f50b9b1257" />
<img width="836" height="831" alt="image" src="https://github.com/user-attachments/assets/8fab0114-ca63-4521-bc58-a48303a17a91" />
<img width="706" height="684" alt="image" src="https://github.com/user-attachments/assets/6b1941ce-0913-4de3-b97c-ceb26edefade" />

## Demo for the app 
<img width="1294" height="327" alt="image" src="https://github.com/user-attachments/assets/982db06a-8acd-4a37-b889-25aca9a7e30a" />

---

# Protocol & Functionality

The system consists of a **C++ Server** handling the logic and a **Python Client** for the user interface. Communications happen over a persistent TCP connection. All commands and responses are terminated by a newline (`\n`).

### Available Commands

| Command | Arguments | Description | Success Response |
| :--- | :--- | :--- | :--- |
| **POST** | `[userid] [prodID1] [prodID2]...` | Add a **new** user and their viewed products. | `201 Created` |
| **PATCH** | `[userid] [prodID1] [prodID2]...` | Add products to an **existing** user. | `204 No Content` |
| **DELETE** | `[userid] [prodID1] [prodID2]...` | Remove specific product views for a user. | `204 No Content` |
| **GET** | `[userid] [productid]` | Request up to 10 recommendations. | `200 Ok \n\n [Data]` |
| **help** | (none) | List available commands in alphabetical order. | List of commands |

### Status Codes
* **200 Ok**: Request successful (used for GET and help).
* **201 Created**: Successfully added a new user (POST).
* **204 No Content**: Successfully updated or deleted data (PATCH/DELETE).
* **400 Bad Request**: Invalid command syntax or unrecognized command.
* **404 Not Found**: Logical error (e.g., PATCH on non-existent user or DELETE on unviewed product).

---

# Setup and Execution

## Run the full system with Docker Compose
This is the recommended way to run the project. It starts both services:

* `cpp-service`: the C++ recommendation server on port `8080`.
* `web`: the Express REST API on port `3000`.

From the repository root:

```bash
docker compose up --build
```

After startup, the web API is available at:

```text
http://localhost:3000
```

Example user flow:

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret","name":"Alice","address":"1 Main St"}'
```

Then log in and receive a token cookie:

```bash
curl -i -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'
```

Use the returned `token` cookie, or the JSON token as a Bearer token, when
requesting protected user routes:

```bash
curl -i http://localhost:3000/api/users/<user-id> \
  -H "Authorization: Bearer <token>"
```

## Build using Docker
To build the server environment:
```bash
docker build -t wolt-app .
```

## Run using Docker
The server requires a port number as a command-line argument.

Run server on port 8080
```bash
docker run -it -p 8080:8080 wolt-app 8080
```

## Running the Client
Run the client from your local machine using Python 3:

Usage: python3 src/client.py [IP] [PORT]
```bash
python3 src/client.py 127.0.0.1 8080
```

## Running the Web Server Locally
If you want to run the Node web service without Docker, first make sure the C++
recommendation server is running and reachable.

In one terminal, run the C++ service on port `8080`:

```bash
docker build -t wolt-app .
docker run -it -p 8080:8080 wolt-app 8080
```

In another terminal, run the web service:

```bash
cd web
npm install
CPP_SERVICE_HOST=127.0.0.1 CPP_SERVICE_PORT=8080 PORT=3000 npm start
```

The web API will be available at:

```text
http://localhost:3000
```

## Running Tests
To run the C++ unit tests inside the Docker container:

```bash
docker run -it --entrypoint ./build/tests/unit_tests wolt-app
```

To run the web REST API integration tests:

```bash
cd web
npm install
npm test
```

*Note: The web tests run using Node's built-in test runner (`node --test`), which requires Node.js v18 or newer. If you have multiple Node versions or Node is not in your global path (e.g. on Windows with VS/Playwright), you can execute them directly pointing to your Node executable:*

```powershell
& "path\to\node.exe" --test tests/users.test.js tests/orders.test.js
```

