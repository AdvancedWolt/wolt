# AdvancedWolt – Exercise 4: React Web Application

This is **Exercise 4**: a full-stack food-delivery web application. We have added a dynamic **React** frontend to the Node.js + Express backend from Exercise 3, which in turn connects to the C++ TCP server from Exercise 2 for recommendations.

The assignment is split into two parts:
* **Part A:** Agile project management using JIRA.
* **Part B:** A React web application with Wolt-inspired design, JWT authentication, and dynamic data integration.

> The Exercise 2 SOLID answers are kept in the [appendix](#appendix--exercise-2) at the bottom.

---

## Part A: Agile Workflow (JIRA & GitHub)

The development process was strictly managed via JIRA and synchronized with GitHub, adhering to Agile principles:

* **Epics & User Stories:** The application was divided into logical epics (e.g., Authentication, Ordering, UI/UX) containing specific user stories and actionable tasks.
* **Sprints & Scrum:** The work was organized into sprints. A Scrum Master was appointed to guide sprint planning, and regular status meetings were held (and documented) at least twice a week.
* **Workflow Statuses:** Issues moved through `To Do`, `In Progress`, `Code Review`, and `Done`. Tasks were assigned to members before work began.
* **Blocked Tasks:** Dependencies were explicitly tracked using the `blocked by` link type in JIRA.
* **Feature Branches & Pull Requests:** Every task was developed on a dedicated feature branch named after the JIRA issue (e.g., `AW-12-login-page`). Code was merged to the main branch strictly via Pull Requests, which required approval from other team members before merging. The Jira-GitHub integration automatically linked PRs and branches to their respective JIRA issues.

---

## Part B: The React Application (Architecture)

We built a single-page application (SPA) using React, JavaScript, CSS, and HTML. No mock data is used; all content is fetched dynamically from the Node.js server.

### System Architecture

```text
Browser (React App)
        │
        ▼  HTTP (JSON + JWT Auth)
┌──────────────────────────────────────────────────────────────────────┐
│  Express Web Server   ·   web/   ·   Exercise 3   ·   Node.js        │
│   (Validations, Routing, Database integration)                       │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼  TCP socket (Newline delimited text)
┌──────────────────────────────────────────────────────────────────────┐
│  C++ Recommendation Server   ·   src/   ·   Exercise 2               │
└──────────────────────────────────────────────────────────────────────┘
```

### Frontend Code Structure

The React codebase (`client/src/`) is structured into functional modules rather than one monolithic component:

* **`pages/`**: The top-level route views.
  * `Login.jsx` / `Register.jsx`: Authentication pages with full client-side validation.
  * `Home.jsx`: The main screen showing nearby/promoted restaurants.
  * `RestaurantDetail.jsx`: The full menu for a specific restaurant.
  * `Search.jsx`: Dynamic search results.
  * `Manage.jsx` / `ManageAccount.jsx`: Management dashboards.
  * `Cart.jsx` / `Orders.jsx`: Shopping cart and order history.
* **`components/`**: Reusable UI elements.
  * `Navbar.jsx`: The top navigation bar, displaying user details, auth controls, and the theme toggle.
  * `RestaurantCard.jsx`, `MenuItem.jsx`, `CartLine.jsx`, etc.
* **`context/`**: Global state management.
  * `AuthContext.jsx`: Manages the JWT token, current user details, and provides `login()`, `register()`, and `logout()` functions.
  * `ThemeContext.jsx`: Manages the application-wide dark/light mode state.
  * `CartContext.jsx`: Manages the shopping cart state.
* **`routes/`**: Route protection logic. Contains `ProtectedRoute` components that enforce authentication for sensitive pages.

### Features & In-Depth GUI Walkthrough

1. **Authentication (JWT) & Registration**
   * **Sign Up:** Users can register an account by providing a unique username, secure password (requiring at least 8 characters, letters, and digits), a display name, geographic location (X/Y coordinates), and an optional profile image (up to 5MB). The UI features a dynamic image preview and real-time form validation.
   * **Login:** Registered users can log in to receive a JWT. The application securely manages this token in the `AuthContext`.
   * **Route Protection:** Unauthenticated users can browse restaurants and menus, but attempting to access the shopping cart or order history will automatically redirect them to the Login page.
   <p align="center">
     <em>[PLACEHOLDER: docs/screenshots/register.png] - Registration screen showing validation errors and image preview.</em>
   </p>

2. **Home Screen (Restaurant Discovery)**
   * **Personalized View:** Upon logging in, the Navbar updates to display the user's name and profile image.
   * **Restaurant Listing:** The main dashboard fetches data from the Express backend and displays restaurant cards, distinguishing between "Nearby" and "Promoted" locations.
   * **Responsive Design:** Wolt-inspired cards with smooth hover effects and responsive grids.
   <p align="center">
     <em>docs/screenshots/home.png</em>
   </p>

3. **Restaurant Menus & Recommendations**
   * **Full Menu:** Clicking a restaurant opens its dedicated page, displaying a grid of available products (dishes) with their prices and descriptions.
   * **Smart Recommendations:** When a user views a product, the Node.js server seamlessly communicates with the C++ TCP server (from Exercise 2) to log the view and fetch personalized "Users also viewed" recommendations, which are displayed dynamically on the page.
   <p align="center">
     <em>[PLACEHOLDER: docs/screenshots/menu.png] - Restaurant detail page showing the product menu and recommendations.</em>
   </p>

4. **Shopping Cart & Checkout**
   * **Cart Management:** Users can add multiple products from a restaurant to their shopping cart. A persistent cart context tracks the selected items.
   * **Real-time Totals:** The cart instantly recalculates sub-totals and allows the user to increment, decrement, or remove items before proceeding to checkout.
   * **Placing Orders:** A single click sends the order payload to the backend, which creates a new pending order attached to the user's account.

5. **Order Management & History**
   * **Tracking Orders:** The "My Orders" dashboard allows logged-in users to review all their past and active orders.
   * **Order Details & Status Updates:** Users can view the itemized receipt for any specific order and change its status (e.g., from `pending` to `completed`) using a simple, intuitive interface that PATCHes the backend.
   <p align="center">
     <em>[PLACEHOLDER: docs/screenshots/orders.png] - Order history dashboard and status management.</em>
   </p>

6. **Search Functionality**
   * **Global Search:** A dedicated search bar in the Navbar allows users to query the entire platform.
   * **Granular Results:** The search results page dynamically categorizes matches, showing matching restaurants alongside individual dishes whose name or description contains the query.
   <p align="center">
     <em>[PLACEHOLDER: docs/screenshots/search.png] - Search results page displaying matching items.</em>
   </p>

7. **Dynamic Theming (Light/Dark Mode)**
   * **Instant Switch:** The Navbar includes a moon/sun toggle icon that instantly switches the application between `light mode` and `dark mode`. 
   * **Global Application:** This toggles CSS variables globally across all components, instantly re-coloring backgrounds, text, and borders for a comfortable viewing experience without reloading the page.
   <p align="center">
     <em>[PLACEHOLDER: docs/screenshots/dark-mode.png] - The application GUI with Dark Mode enabled.</em>
   </p>

---

## Running the Application

The entire stack is containerized using Docker Compose.

### Quick Start (Docker Compose)

From the root of the project, run:

```bash
docker compose up --build
```

<p align="center">
  <em>[PLACEHOLDER: docs/screenshots/docker-build.png] - Terminal output showing the successful compilation of the React app, Express server, and C++ service.</em>
</p>

This starts three containers:
1. **`cpp-service`**: The Exercise 2 C++ server on port 8080.
2. **`web`**: The Express API backend on port 3000.
3. **`client`**: The Vite dev server serving the React frontend on port 5173.

Once the containers are running, open your browser to:
**[http://localhost:5173](http://localhost:5173)**

*Note: Inside the Docker network, the React app proxies its `/api` requests to `http://web:3000`, so cross-container communication works seamlessly.*

### Running Manually

If you prefer to run the components independently:

**1. Start the C++ Server**
```bash
docker build -t wolt-cpp .
docker run --rm -p 8080:8080 wolt-cpp 8080
```

**2. Start the Node.js Server**
```bash
cd web
npm install
CPP_SERVICE_HOST=127.0.0.1 CPP_SERVICE_PORT=8080 PORT=3000 npm start
```

**3. Start the React App**
```bash
cd client
npm install
VITE_API_URL=http://localhost:3000 npm run dev
```

---

## Security Note

This is a university assignment. No real credentials, API keys, or sensitive personal data are stored in this repository or transmitted to the server. Fake users and tokens are utilized solely for demonstration purposes.

---

# Appendix – Exercise 2

These questions are from **Exercise 2**. The answers are kept here as they were so they're easy to find.

### 1. Command names changed (add → POST, recommend → GET)
**Did it require touching closed code?**
Yes, in ex1 command names were hardcoded strings scattered across `AppInternals` dispatch logic. There was no registry abstraction.

**Fix applied (ex2):** `CommandManager` holds a `std::unordered_map<std::string, ICommand*>` registry. The dispatcher never mentions a command name, it just looks up the key and forwards. Renaming a command is a single string change at the registration site (e.g. `app.cpp`). `CommandParser` lowercases the verb before lookup, so case sensitivity is handled in one place too. The dispatcher is now genuinely closed to this change.

### 2. New commands added (PATCH, DELETE)
**Did it require touching closed code?**
No. Each new command is a self-contained class implementing `ICommand`:
```cpp
virtual models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) = 0;
```
Registration is one line per command at startup. `CommandManager::dispatch` and all existing commands are untouched. `HelpCommand` queries the `CommandManager` registry dynamically, new commands appear in `help` output automatically with zero changes to `HelpCommand` itself. This is the Open/Closed Principle working as intended.

### 3. Command output format changed
**Did it require touching closed code?**
Partially. In ex1 commands returned raw strings and each command owned its own formatting. There was no shared wire-format abstraction.

**Fix applied (ex2):** The new `models::Response` class with a `toWire()` method centralizes all wire serialization. Commands return a semantic `Response` object, not a raw string. Changing how a status serializes to wire bytes now means touching only `Response::toWire()`, not every command that produces that status. The `models::Status` enum + lookup table further ensure that adding or renaming a status phrase is a single-line change.

### 4. I/O moved from console to TCP sockets
**Did it require touching closed code?**
No. This was the cleanest boundary in the design. Commands operate on `ParsedCommand` structs and return `Response` objects, they have zero knowledge of transport. The server loop in `main.cpp` owns the socket, reads a line, calls `CommandParser` -> `CommandManager`, then writes `response.toWire()` to the file descriptor. Switching from `std::cin`/`std::cout` to a socket touched only `main.cpp`.
