# AdvancedWolt – Exercise 4: React Web Application

This is **Exercise 4**: a full-stack food-delivery web application. We have added a dynamic **React** frontend to the Node.js + Express backend from Exercise 3, which in turn connects to the C++ TCP server from Exercise 2 for recommendations.

The assignment is split into two parts:
* **Part A:** Agile project management using JIRA.
* **Part B:** A React web application with Wolt-inspired design, JWT authentication, and dynamic data integration.

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

---

## Running the Application

The entire stack is containerized using Docker Compose.

### Quick Start (Docker Compose)

From the root of the project, run:

```bash
docker compose up --build
```

<p align="center">
  <em><img width="746" height="527" alt="image" src="https://github.com/user-attachments/assets/6495bf84-c938-4bb3-8655-76af5beecc5d" />
</em>
</p>

This starts four containers:
1. **`cpp-service`**: The Exercise 2 C++ server on port 8080.
2. **`mongo`**: A MongoDB instance on port 27017. Its data is stored in the named Docker volume `mongo-data`, so it **survives container restarts** (`docker compose down` followed by `docker compose up` keeps your data).
3. **`web`**: The Express API backend on port 3000. It connects to MongoDB through Mongoose on boot.
4. **`client`**: The Vite dev server serving the React frontend on port 5173.

Once the containers are running, open your browser to:
**[http://localhost:5173](http://localhost:5173)**

*Note: Inside the Docker network, the React app proxies its `/api` requests to `http://web:3000`, so cross-container communication works seamlessly.*

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


