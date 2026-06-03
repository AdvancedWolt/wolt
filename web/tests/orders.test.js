const { test, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const ordersRoutes = require('../src/routes/orders');
const restaurantsRoutes = require('../src/routes/restaurants');
const usersRoutes = require('../src/routes/users');
const tokensRoutes = require('../src/routes/tokens');
const productsRoutes = require('../src/routes/products');

let server;
let base;

before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRoutes);
    app.use('/api/restaurants', restaurantsRoutes);
    app.use('/api/restaurants/:id/products', productsRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/tokens', tokensRoutes);
    await new Promise((resolve) => {
        server = app.listen(0, resolve);
    });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
    server.close();
});

const request = async (method, path, body, headers = {}) => {
    const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(base + path, opts);
    let json = null;
    try {
        json = await res.json();
    } catch (_) {
        json = null;
    }
    return { status: res.status, headers: res.headers, json };
};

// --- Helper: create a user and return their id + auth headers ---
const createAuthenticatedUser = async (username) => {
    const created = await request('POST', '/api/users', {
        username,
        password: 'secret',
        name: username
    });
    const userId = created.json.id;
    return { userId, headers: { 'user-id': userId } };
};

// --- Helper: create a restaurant and return its id ---
const createRestaurant = async (name) => {
    const created = await request('POST', '/api/restaurants', { name });
    const id = created.headers.get('location').split('/').pop();
    return id;
};

// --- Helper: create a product and return its id ---
const createProduct = async (restaurantId, name) => {
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, { name });
    const id = created.headers.get('location').split('/').pop();
    return id;
};

// ============================================================
// POST /api/orders — Create a new order
// ============================================================

test('POST /api/orders creates an order -> 201 + Location', async () => {
    const { headers } = await createAuthenticatedUser('order-creator');
    const restaurantId = await createRestaurant('Order Restaurant');
    const pizzaId = await createProduct(restaurantId, 'pizza');
    const saladId = await createProduct(restaurantId, 'salad');

    const res = await request('POST', '/api/orders', {
        restaurantId,
        items: [pizzaId, saladId]
    }, headers);

    assert.strictEqual(res.status, 201);
    const location = res.headers.get('location');
    assert.match(location, /^\/api\/orders\/.+/);
});

test('POST /api/orders without user-id header -> 401', async () => {
    const restaurantId = await createRestaurant('Unauth Order Restaurant');
    const pizzaId = await createProduct(restaurantId, 'pizza');

    const res = await request('POST', '/api/orders', {
        restaurantId,
        items: [pizzaId]
    });

    assert.strictEqual(res.status, 401);
});

test('POST /api/orders with missing restaurantId -> 400', async () => {
    const { headers } = await createAuthenticatedUser('order-missing-restaurant');

    const res = await request('POST', '/api/orders', {
        items: ['pizza']
    }, headers);

    assert.strictEqual(res.status, 400);
});

test('POST /api/orders with unknown restaurantId -> 404', async () => {
    const { headers } = await createAuthenticatedUser('order-unknown-restaurant');

    const res = await request('POST', '/api/orders', {
        restaurantId: 'unknown-restaurant-id',
        items: ['pizza']
    }, headers);

    assert.strictEqual(res.status, 404);
});

test('POST /api/orders with invalid product (not in restaurant) -> 400', async () => {
    const { headers } = await createAuthenticatedUser('order-invalid-product');
    const restaurantA = await createRestaurant('Restaurant A');
    const restaurantB = await createRestaurant('Restaurant B');
    
    // Product belongs to Restaurant B
    const productB = await createProduct(restaurantB, 'burger-b');

    // Attempt to order from Restaurant A with product from Restaurant B
    const res = await request('POST', '/api/orders', {
        restaurantId: restaurantA,
        items: [productB]
    }, headers);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.json.error, 'All products must belong to the correct restaurant');
});

test('POST /api/orders with non-existent product -> 400', async () => {
    const { headers } = await createAuthenticatedUser('order-nonexistent-product');
    const restaurantId = await createRestaurant('Product Restaurant');

    const res = await request('POST', '/api/orders', {
        restaurantId,
        items: ['some-fake-product-uuid']
    }, headers);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.json.error, 'All products must belong to the correct restaurant');
});

test('POST /api/orders without items still creates order with empty items', async () => {
    const { userId, headers } = await createAuthenticatedUser('order-no-items');
    const restaurantId = await createRestaurant('No Items Restaurant');

    const created = await request('POST', '/api/orders', {
        restaurantId
    }, headers);

    assert.strictEqual(created.status, 201);

    // Fetch the created order to verify items defaults to []
    const orderId = created.headers.get('location').split('/').pop();
    const fetched = await request('GET', `/api/orders/${orderId}`, undefined, headers);

    assert.strictEqual(fetched.status, 200);
    assert.deepStrictEqual(fetched.json.items, []);
    assert.strictEqual(fetched.json.userId, userId);
    assert.strictEqual(fetched.json.restaurantId, restaurantId);
});

// ============================================================
// GET /api/orders — List orders for the logged-in user
// ============================================================

test('GET /api/orders returns orders for the authenticated user', async () => {
    const { userId, headers } = await createAuthenticatedUser('order-list-user');
    const restaurantId = await createRestaurant('List Restaurant');
    const itemId1 = await createProduct(restaurantId, 'item-1');
    const itemId2 = await createProduct(restaurantId, 'item-2');

    // Initially empty
    const empty = await request('GET', '/api/orders', undefined, headers);
    assert.strictEqual(empty.status, 200);
    assert.deepStrictEqual(empty.json, []);

    // Create two orders
    await request('POST', '/api/orders', { restaurantId, items: [itemId1] }, headers);
    await request('POST', '/api/orders', { restaurantId, items: [itemId2] }, headers);

    const list = await request('GET', '/api/orders', undefined, headers);
    assert.strictEqual(list.status, 200);
    assert.strictEqual(list.json.length, 2);
    assert.ok(list.json.every(o => o.userId === userId));
});

test('GET /api/orders without user-id header -> 401', async () => {
    const res = await request('GET', '/api/orders');

    assert.strictEqual(res.status, 401);
});

test('GET /api/orders does not return other users orders', async () => {
    const alice = await createAuthenticatedUser('order-isolation-alice');
    const bob = await createAuthenticatedUser('order-isolation-bob');
    const restaurantId = await createRestaurant('Isolation Restaurant');
    const itemId = await createProduct(restaurantId, 'alice-item');

    // Alice creates an order
    await request('POST', '/api/orders', { restaurantId, items: [itemId] }, alice.headers);

    // Bob should not see Alice's order
    const bobOrders = await request('GET', '/api/orders', undefined, bob.headers);
    assert.strictEqual(bobOrders.status, 200);
    assert.strictEqual(bobOrders.json.length, 0);
});

// ============================================================
// GET /api/orders/:id — Get order details
// ============================================================

test('GET /api/orders/:id returns order details', async () => {
    const { userId, headers } = await createAuthenticatedUser('order-detail-user');
    const restaurantId = await createRestaurant('Detail Restaurant');
    const burgerId = await createProduct(restaurantId, 'burger');
    const friesId = await createProduct(restaurantId, 'fries');

    const created = await request('POST', '/api/orders', {
        restaurantId,
        items: [burgerId, friesId]
    }, headers);
    const orderId = created.headers.get('location').split('/').pop();

    const res = await request('GET', `/api/orders/${orderId}`, undefined, headers);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.id, orderId);
    assert.strictEqual(res.json.userId, userId);
    assert.strictEqual(res.json.restaurantId, restaurantId);
    assert.deepStrictEqual(res.json.items, [burgerId, friesId]);
    assert.strictEqual(res.json.status, 'pending');
});

test('GET /api/orders/:id unknown order -> 404', async () => {
    const { headers } = await createAuthenticatedUser('order-detail-404');

    const res = await request('GET', '/api/orders/unknown-order-id', undefined, headers);

    assert.strictEqual(res.status, 404);
});

test('GET /api/orders/:id without user-id header -> 401', async () => {
    const res = await request('GET', '/api/orders/some-id');

    assert.strictEqual(res.status, 401);
});

// ============================================================
// PATCH /api/orders/:id — Update order details
// ============================================================

test('PATCH /api/orders/:id updates order items -> 204', async () => {
    const { headers } = await createAuthenticatedUser('order-patch-items');
    const restaurantId = await createRestaurant('Patch Items Restaurant');
    const oldId = await createProduct(restaurantId, 'old-item');
    const newId1 = await createProduct(restaurantId, 'new-item-1');
    const newId2 = await createProduct(restaurantId, 'new-item-2');

    const created = await request('POST', '/api/orders', {
        restaurantId,
        items: [oldId]
    }, headers);
    const orderId = created.headers.get('location').split('/').pop();

    const patched = await request('PATCH', `/api/orders/${orderId}`, {
        items: [newId1, newId2]
    }, headers);

    assert.strictEqual(patched.status, 204);

    const fetched = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.deepStrictEqual(fetched.json.items, [newId1, newId2]);
});

test('PATCH /api/orders/:id with invalid product (not in restaurant) -> 400', async () => {
    const { headers } = await createAuthenticatedUser('order-patch-invalid');
    const restaurantA = await createRestaurant('Patch Restaurant A');
    const restaurantB = await createRestaurant('Patch Restaurant B');
    const prodA = await createProduct(restaurantA, 'prod-a');
    const prodB = await createProduct(restaurantB, 'prod-b');

    // Create order at Restaurant A
    const created = await request('POST', '/api/orders', {
        restaurantId: restaurantA,
        items: [prodA]
    }, headers);
    const orderId = created.headers.get('location').split('/').pop();

    // Patch order at Restaurant A with product from Restaurant B
    const patched = await request('PATCH', `/api/orders/${orderId}`, {
        items: [prodB]
    }, headers);

    assert.strictEqual(patched.status, 400);
    assert.strictEqual(patched.json.error, 'All products must belong to the correct restaurant');
});

test('PATCH /api/orders/:id updates order status -> 204', async () => {
    const { headers } = await createAuthenticatedUser('order-patch-status');
    const restaurantId = await createRestaurant('Patch Status Restaurant');
    const itemId = await createProduct(restaurantId, 'item');

    const created = await request('POST', '/api/orders', {
        restaurantId,
        items: [itemId]
    }, headers);
    const orderId = created.headers.get('location').split('/').pop();

    const patched = await request('PATCH', `/api/orders/${orderId}`, {
        status: 'delivered'
    }, headers);

    assert.strictEqual(patched.status, 204);

    const fetched = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(fetched.json.status, 'delivered');
});

test('PATCH /api/orders/:id unknown order -> 404', async () => {
    const { headers } = await createAuthenticatedUser('order-patch-404');

    const res = await request('PATCH', '/api/orders/unknown-order-id', {
        status: 'delivered'
    }, headers);

    assert.strictEqual(res.status, 404);
});

test('PATCH /api/orders/:id without user-id header -> 401', async () => {
    const res = await request('PATCH', '/api/orders/some-id', {
        status: 'delivered'
    });

    assert.strictEqual(res.status, 401);
});

// ============================================================
// DELETE /api/orders/:id — Delete an order
// ============================================================

test('DELETE /api/orders/:id removes an order -> 204', async () => {
    const { headers } = await createAuthenticatedUser('order-delete-user');
    const restaurantId = await createRestaurant('Delete Restaurant');
    const itemId = await createProduct(restaurantId, 'item');

    const created = await request('POST', '/api/orders', {
        restaurantId,
        items: [itemId]
    }, headers);
    const orderId = created.headers.get('location').split('/').pop();

    const deleted = await request('DELETE', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(deleted.status, 204);

    // Verify the order is gone
    const fetched = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(fetched.status, 404);
});

test('DELETE /api/orders/:id unknown order -> 404', async () => {
    const { headers } = await createAuthenticatedUser('order-delete-404');

    const res = await request('DELETE', '/api/orders/unknown-order-id', undefined, headers);

    assert.strictEqual(res.status, 404);
});

test('DELETE /api/orders/:id without user-id header -> 401', async () => {
    const res = await request('DELETE', '/api/orders/some-id');

    assert.strictEqual(res.status, 401);
});

// ============================================================
// Full lifecycle test
// ============================================================

test('full order lifecycle: create -> read -> update -> delete', async () => {
    const { userId, headers } = await createAuthenticatedUser('order-lifecycle');
    const restaurantId = await createRestaurant('Lifecycle Restaurant');
    const pizzaId = await createProduct(restaurantId, 'pizza');
    const colaId = await createProduct(restaurantId, 'cola');

    // Create
    const created = await request('POST', '/api/orders', {
        restaurantId,
        items: [pizzaId]
    }, headers);
    assert.strictEqual(created.status, 201);
    const orderId = created.headers.get('location').split('/').pop();

    // Read
    const read = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(read.status, 200);
    assert.strictEqual(read.json.id, orderId);
    assert.strictEqual(read.json.userId, userId);
    assert.strictEqual(read.json.restaurantId, restaurantId);
    assert.deepStrictEqual(read.json.items, [pizzaId]);
    assert.strictEqual(read.json.status, 'pending');

    // Update
    const updated = await request('PATCH', `/api/orders/${orderId}`, {
        items: [pizzaId, colaId],
        status: 'in-progress'
    }, headers);
    assert.strictEqual(updated.status, 204);

    // Read updated
    const readUpdated = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.deepStrictEqual(readUpdated.json.items, [pizzaId, colaId]);
    assert.strictEqual(readUpdated.json.status, 'in-progress');

    // Appears in user's order list
    const list = await request('GET', '/api/orders', undefined, headers);
    assert.ok(list.json.some(o => o.id === orderId));

    // Delete
    const deleted = await request('DELETE', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(deleted.status, 204);

    // Verify gone
    const readDeleted = await request('GET', `/api/orders/${orderId}`, undefined, headers);
    assert.strictEqual(readDeleted.status, 404);

    // No longer in user's order list
    const listAfterDelete = await request('GET', '/api/orders', undefined, headers);
    assert.ok(!listAfterDelete.json.some(o => o.id === orderId));
});
