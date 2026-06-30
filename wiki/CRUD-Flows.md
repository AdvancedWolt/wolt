# CRUD Flows — Restaurants, Dishes & Orders

This page demonstrates **create / edit / delete** for restaurants, dishes (products) and
orders on **both** clients. Each flow maps to a real REST endpoint on the Express API. Make
sure the stack is up (**[Environment Setup](Environment-Setup.md)**) and you are logged in
(**[Authentication Flows](Authentication-Flows.md)**).

> ⬅ Back to the [wiki home](Home.md).

---

## Roles & endpoints at a glance

| Domain        | Create                              | Read                                  | Update                                | Delete                                              |
| ------------- | ----------------------------------- | ------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| Restaurants   | `POST /api/restaurants` (owner)     | `GET /api/restaurants[/:id]`          | `PATCH /api/restaurants/:id` (owner)  | `DELETE /api/restaurants/:id` (owner, **cascades**) |
| Dishes        | `POST /api/restaurants/:id/products`| `GET /api/restaurants/:id/products`   | `PATCH …/products/:pId`               | `DELETE …/products/:pId`                             |
| Orders        | `POST /api/orders` (auth)           | `GET /api/orders[/:id]`               | `PATCH /api/orders/:id` (status)      | `DELETE /api/orders/:id`                             |

> **Restaurants and dishes** are managed by **Restaurant owner** accounts via the **Manage**
> screen. **Orders** are created by any logged-in user from the **Cart**. Deleting a
> restaurant cascades — its menu (and related orders) are removed on the server.

---

## Restaurants (create / edit / delete)

### Web — Manage screen

1. Log in as a **Restaurant owner** and open **Manage**.
2. **Create:** fill the new-restaurant form (name, description, location, image) → it appears
   in your list (`POST /api/restaurants`).
3. **Edit:** change a field and save (`PATCH /api/restaurants/:id`).
4. **Delete:** use the confirm dialog; the restaurant and its menu disappear
   (`DELETE /api/restaurants/:id`).

<p align="center">
  <img width="1902" height="922" alt="Web Manage — restaurants & dishes" src="https://github.com/user-attachments/assets/8aed6898-e186-4fe3-9964-5e0271b4177b" />
</p>

### Mobile — Manage screen

The same flow lives behind the **Manage** drawer item for owner accounts.

<p align="center">
  <img width="300" alt="Mobile Manage — creating a restaurant" src="images/mobile-manage-create-restaurant.png" />
</p>

<p align="center">
  <img width="300" alt="Mobile Manage — editing a restaurant" src="images/mobile-manage-edit-restaurant.png" />
</p>

<p align="center">
  <img width="300" alt="Mobile Manage — delete confirmation for a restaurant" src="images/mobile-manage-delete-restaurant.png" />
</p>

---

## Dishes / products (create / edit / delete)

Dishes are nested under a restaurant (`/api/restaurants/:id/products`).

### Web

From a restaurant in **Manage**: add a dish (name, price, description, image), edit its
fields, or delete it. The restaurant menu page reflects the change immediately.

The restaurant menu / dish view on web (also shows recommendations from the C++ server):

<p align="center">
  <img width="1898" height="908" alt="Web restaurant menu with dishes" src="https://github.com/user-attachments/assets/5f85e698-c0d0-46bb-a8dd-1d9ff2485c94" />
  <img width="1878" height="790" alt="Web dish detail & recommendations" src="https://github.com/user-attachments/assets/8e02342b-2977-43f6-b945-083e3c37acbb" />
</p>

### Mobile

<p align="center">
  <img width="300" alt="Mobile — adding a dish to a restaurant" src="images/mobile-add-dish.png" />
</p>

<p align="center">
  <img width="300" alt="Mobile — editing/deleting a dish" src="images/mobile-edit-dish.png" />
</p>

---

## Orders (create / view / update status / delete)

Any logged-in user can place an order from the **Cart**, then track it under **Orders**.

### Web

1. Add dishes to the **Cart**; quantities and totals update live.
2. **Place order** → creates a pending order (`POST /api/orders`).
3. Open **Orders → order detail** to see the itemized receipt; change the status
   (`PATCH /api/orders/:id`) or delete the order (`DELETE /api/orders/:id`).

<p align="center">
  <img width="1896" height="897" alt="Web orders & order detail with status" src="https://github.com/user-attachments/assets/2f6410ad-f7d7-4100-8e8c-9d007032110e" />
</p>

### Mobile

<p align="center">
  <img width="300" alt="Mobile cart with items, placing an order" src="images/mobile-cart-order.png" />
</p>

<p align="center">
  <img width="300" alt="Mobile order detail and changing the order status" src="images/mobile-order-status.png" />
</p>

---

## Search (bonus flow, both clients)

A global search queries restaurants and dishes together (`GET /api/search/:query`).
Both clients search as you type and group the matches into **Restaurants** and
**Dishes & items**.

### Web

<p align="center">
  <img width="1906" height="897" alt="Web search results" src="https://github.com/user-attachments/assets/b99b082d-3bdb-45c3-b314-42e6443465a1" />
</p>

### Mobile

<p align="center">
  <img width="300" alt="Mobile search results grouped into restaurants and dishes" src="images/mobile-search.png" />
</p>

---

That completes the main flows. Back to the **[wiki home](Home.md)**.
