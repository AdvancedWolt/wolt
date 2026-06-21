const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';
const OWNER_AUTH = `Bearer ${jwt.sign({ userId: 'test-owner', role: 'restaurant_owner' }, JWT_SECRET)}`;

const express = require('express');
const usersRoutes = require('../src/routes/users');
const tokensRoutes = require('../src/routes/tokens');
const restaurantsRoutes = require('../src/routes/restaurants');
const productsRoutes = require('../src/routes/products');
const User = require('../src/models/users');
const { tcpClient } = require('../src/services/tcpClient');

// Valid registration defaults: the API enforces a strong password and a location.
const PASSWORD = 'Password123';
const LOCATION = { x: 32.08, y: 34.78 };
const newUser = (username, name = username, extra = {}) => ({
    username,
    password: PASSWORD,
    name,
    location: LOCATION,
    ...extra
});

let server;
let base;

before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
    app.use('/api/tokens', tokensRoutes);
    app.use('/api/restaurants', restaurantsRoutes);
    app.use('/api/restaurants/:id/products', productsRoutes);
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
    if (
        ['POST', 'PATCH', 'DELETE'].includes(method)
        && path.startsWith('/api/restaurants')
        && !Object.hasOwn(headers, 'Authorization')
        && !Object.hasOwn(headers, 'authorization')
    ) {
        opts.headers.Authorization = OWNER_AUTH;
    }
    // Tests authenticate with a convenient `user-id` header; translate it into the
    // Bearer JWT the API actually expects.
    if (opts.headers['user-id']) {
        opts.headers.Authorization = `Bearer ${jwt.sign(
            { userId: opts.headers['user-id'], role: 'customer' },
            JWT_SECRET
        )}`;
        delete opts.headers['user-id'];
    }
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

// Story: As a new user, I want to create an account.
test('POST /api/users with username and password -> 201 + Location /api/users/:id', async () => {
    const res = await request('POST', '/api/users', newUser('alice', 'Alice'));

    assert.strictEqual(res.status, 201);
    const location = res.headers.get('location');
    assert.match(location, /^\/api\/users\/.+/);
    assert.ok(res.json.id, 'response should include the new id');
    assert.strictEqual(res.json.username, 'alice');
    assert.strictEqual(res.json.name, 'Alice');
    assert.strictEqual(res.json.password, undefined);
    assert.strictEqual(res.json.passwordHash, undefined);
});

test('POST /api/users with missing username -> 400', async () => {
    const res = await request('POST', '/api/users', { password: PASSWORD, location: LOCATION });

    assert.strictEqual(res.status, 400);
});

test('POST /api/users with missing password -> 400', async () => {
    const res = await request('POST', '/api/users', { username: 'no-password', location: LOCATION });

    assert.strictEqual(res.status, 400);
});

test('POST /api/users with a weak password -> 400', async () => {
    const res = await request('POST', '/api/users', newUser('weak-password', 'Weak', { password: 'secret' }));

    assert.strictEqual(res.status, 400);
});

test('POST /api/users without a location -> 400', async () => {
    const res = await request('POST', '/api/users', { username: 'no-location', password: PASSWORD, name: 'No Location' });

    assert.strictEqual(res.status, 400);
});

// Story: As a user, I want to fetch my profile to see my details.
test('GET /api/users/:id for existing id -> 200 + JSON', async () => {
    const created = await request('POST', '/api/users', newUser('bob', 'Bob'));
    const id = created.json.id;

    const res = await request('GET', `/api/users/${id}`, undefined, { 'user-id': id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.id, id);
    assert.strictEqual(res.json.username, 'bob');
    assert.strictEqual(res.json.name, 'Bob');
    assert.strictEqual(res.json.password, undefined);
    assert.strictEqual(res.json.passwordHash, undefined);
});

test('GET /api/users/:id for an id that is not your own -> 403', async () => {
    const created = await request('POST', '/api/users', newUser('unknown-checker', 'Unknown Checker'));

    const res = await request(
        'GET',
        '/api/users/does-not-exist',
        undefined,
        { 'user-id': created.json.id }
    );

    assert.strictEqual(res.status, 403);
});

test('POST /api/tokens with valid credentials -> 200 + token + user id', async () => {
    const created = await request('POST', '/api/users', newUser('carol', 'Carol'));

    const res = await request('POST', '/api/tokens', {
        username: 'carol',
        password: PASSWORD
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.userId, created.json.id);
    assert.strictEqual(typeof res.json.token, 'string');
    assert.ok(res.json.token.length > 0);
});

test('POST /api/tokens with invalid credentials -> 404', async () => {
    await request('POST', '/api/users', newUser('dave', 'Dave'));

    const res = await request('POST', '/api/tokens', {
        username: 'dave',
        password: 'WrongPass123'
    });

    assert.strictEqual(res.status, 404);
});

test('GET /api/users/:id without auth -> 401', async () => {
    const created = await request('POST', '/api/users', newUser('henry', 'Henry'));

    const res = await request('GET', `/api/users/${created.json.id}`);

    assert.strictEqual(res.status, 401);
});

test('GET /api/users/:id cannot read another user -> 403', async () => {
    const first = await request('POST', '/api/users', newUser('iris', 'Iris'));
    const second = await request('POST', '/api/users', newUser('jane', 'Jane'));

    const res = await request(
        'GET',
        `/api/users/${first.json.id}`,
        undefined,
        { 'user-id': second.json.id }
    );

    assert.strictEqual(res.status, 403);
});

test('GET /api/users/:id/recommendations with own auth -> 200', async () => {
    tcpClient.getRecommendations = async () => 'product-2 product-3';

    const created = await request('POST', '/api/users', newUser('kate', 'Kate'));

    const res = await request(
        'GET',
        `/api/users/${created.json.id}/recommendations?productId=product-1`,
        undefined,
        { 'user-id': created.json.id }
    );

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.json, { recommendations: 'product-2 product-3' });
});

test('GET /api/users/:id/recommendations cannot read another user -> 403', async () => {
    const first = await request('POST', '/api/users', newUser('leo', 'Leo'));
    const second = await request('POST', '/api/users', newUser('maya', 'Maya'));

    const res = await request(
        'GET',
        `/api/users/${first.json.id}/recommendations?productId=product-1`,
        undefined,
        { 'user-id': second.json.id }
    );

    assert.strictEqual(res.status, 403);
});

test('direct user view routes are not exposed', async () => {
    const created = await request('POST', '/api/users', newUser('erin', 'Erin'));

    const res = await request('POST', `/api/users/${created.json.id}/views`, { productId: 'p1' });

    assert.strictEqual(res.status, 404);
});

test('POST /api/users with duplicate username -> 409', async () => {
    await request('POST', '/api/users', newUser('duplicate-user', 'First Duplicate'));

    const res = await request('POST', '/api/users', newUser('duplicate-user', 'Second Duplicate'));

    assert.strictEqual(res.status, 409);
});

test('GET /api/users/:id/recommendations without productId -> 400', async () => {
    const created = await request('POST', '/api/users', newUser('missing-recommendation-product', 'Missing Product'));

    const res = await request(
        'GET',
        `/api/users/${created.json.id}/recommendations`,
        undefined,
        { 'user-id': created.json.id }
    );

    assert.strictEqual(res.status, 400);
});

test('GET /api/restaurants initially returns an array', async () => {
    const res = await request('GET', '/api/restaurants');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json));
});

test('POST /api/restaurants creates a restaurant with Location', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Restaurant Create Test',
        category: 'Italian',
        image: 'https://images.example/restaurant.jpg',
        promoted: true,
        location: { x: 32.0853, y: 34.7818 }
    });

    assert.strictEqual(created.status, 201);
    assert.match(created.headers.get('location'), /^\/api\/restaurants\/.+/);

    const id = created.headers.get('location').split('/').pop();
    const fetched = await request('GET', `/api/restaurants/${id}`);

    assert.strictEqual(fetched.status, 200);
    assert.strictEqual(fetched.json.id, id);
    assert.strictEqual(fetched.json.name, 'Restaurant Create Test');
    assert.strictEqual(fetched.json.category, 'Italian');
    assert.strictEqual(fetched.json.image, 'https://images.example/restaurant.jpg');
    assert.strictEqual(fetched.json.promoted, true);
    assert.deepStrictEqual(fetched.json.location, { x: 32.0853, y: 34.7818 });
});

test('POST /api/restaurants requires a restaurant owner', async () => {
    const missingCredentials = await request(
        'POST',
        '/api/restaurants',
        { name: 'Unauthorized Restaurant' },
        { Authorization: '' }
    );
    const customerToken = jwt.sign(
        { userId: 'test-customer', role: 'customer' },
        JWT_SECRET
    );
    const customerRequest = await request(
        'POST',
        '/api/restaurants',
        { name: 'Customer Restaurant' },
        { Authorization: `Bearer ${customerToken}` }
    );

    assert.strictEqual(missingCredentials.status, 401);
    assert.strictEqual(customerRequest.status, 403);
});

test('restaurant owner can register, log in and create a restaurant', async () => {
    const registration = await request('POST', '/api/users', {
        username: 'restaurant-owner',
        password: 'OwnerPass123',
        displayName: 'Restaurant Owner',
        location: { x: 32.08, y: 34.78 },
        role: 'restaurant_owner'
    });
    const login = await request('POST', '/api/tokens', {
        username: 'restaurant-owner',
        password: 'OwnerPass123'
    });
    const created = await request(
        'POST',
        '/api/restaurants',
        { name: 'Owner Restaurant', category: 'Owner Picks' },
        { Authorization: `Bearer ${login.json.token}` }
    );

    assert.strictEqual(registration.status, 201);
    assert.strictEqual(registration.json.role, 'restaurant_owner');
    assert.strictEqual(login.status, 200);
    assert.strictEqual(login.json.role, 'restaurant_owner');
    assert.deepStrictEqual(login.json.location, { x: 32.08, y: 34.78 });
    assert.strictEqual(created.status, 201);
});

test('restaurant owner cannot manage another owner restaurant or menu', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Protected Owner Restaurant'
    });
    const restaurantId = created.headers.get('location').split('/').pop();
    const otherOwnerToken = jwt.sign(
        { userId: 'different-owner', role: 'restaurant_owner' },
        JWT_SECRET
    );
    const headers = { Authorization: `Bearer ${otherOwnerToken}` };

    const update = await request(
        'PATCH',
        `/api/restaurants/${restaurantId}`,
        { name: 'Stolen Restaurant' },
        headers
    );
    const addProduct = await request(
        'POST',
        `/api/restaurants/${restaurantId}/products`,
        { name: 'Unauthorized Dish' },
        headers
    );
    const remove = await request(
        'DELETE',
        `/api/restaurants/${restaurantId}`,
        undefined,
        headers
    );

    assert.strictEqual(update.status, 403);
    assert.strictEqual(addProduct.status, 403);
    assert.strictEqual(remove.status, 403);
});

test('POST /api/users rejects an unknown account role', async () => {
    const response = await request('POST', '/api/users', {
        username: 'invalid-role-user',
        password: 'Password123',
        displayName: 'Invalid Role',
        location: { x: 32.08, y: 34.78 },
        role: 'admin'
    });

    assert.strictEqual(response.status, 400);
});

test('restaurants use feed-safe defaults for optional metadata', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Restaurant Metadata Defaults'
    });
    const id = created.headers.get('location').split('/').pop();
    const fetched = await request('GET', `/api/restaurants/${id}`);

    assert.strictEqual(fetched.json.category, 'Other');
    assert.strictEqual(fetched.json.image, null);
    assert.strictEqual(fetched.json.promoted, false);
    assert.strictEqual(fetched.json.location, null);
});

test('POST /api/restaurants with missing name -> 400', async () => {
    const res = await request('POST', '/api/restaurants', {});

    assert.strictEqual(res.status, 400);
});

test('POST /api/restaurants validates feed metadata', async () => {
    const blankName = await request('POST', '/api/restaurants', { name: '   ' });
    const invalidCategory = await request('POST', '/api/restaurants', {
        name: 'Invalid Category',
        category: 42
    });
    const invalidPromoted = await request('POST', '/api/restaurants', {
        name: 'Invalid Promotion',
        promoted: 'yes'
    });

    assert.strictEqual(blankName.status, 400);
    assert.strictEqual(invalidCategory.status, 400);
    assert.strictEqual(invalidPromoted.status, 400);
});

test('GET /api/restaurants/:id unknown -> 404', async () => {
    const res = await request('GET', '/api/restaurants/unknown-restaurant');

    assert.strictEqual(res.status, 404);
});

test('PATCH /api/restaurants/:id updates a restaurant', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Restaurant Before Patch'
    });
    const id = created.headers.get('location').split('/').pop();

    const patched = await request('PATCH', `/api/restaurants/${id}`, {
        name: 'Restaurant After Patch',
        category: 'Asian',
        image: 'https://images.example/updated.jpg',
        promoted: true,
        location: { x: 31.7683, y: 35.2137 }
    });
    const fetched = await request('GET', `/api/restaurants/${id}`);

    assert.strictEqual(patched.status, 204);
    assert.strictEqual(fetched.json.name, 'Restaurant After Patch');
    assert.strictEqual(fetched.json.category, 'Asian');
    assert.strictEqual(fetched.json.image, 'https://images.example/updated.jpg');
    assert.strictEqual(fetched.json.promoted, true);
    assert.deepStrictEqual(fetched.json.location, { x: 31.7683, y: 35.2137 });
});

test('PATCH /api/restaurants/:id missing or unknown -> 400/404', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Restaurant Patch Errors'
    });
    const id = created.headers.get('location').split('/').pop();

    const missingName = await request('PATCH', `/api/restaurants/${id}`, {});
    const unknown = await request('PATCH', '/api/restaurants/unknown-restaurant', {
        name: 'Updated'
    });

    assert.strictEqual(missingName.status, 400);
    assert.strictEqual(unknown.status, 404);
});

test('DELETE /api/restaurants/:id removes a restaurant', async () => {
    const created = await request('POST', '/api/restaurants', {
        name: 'Restaurant Delete Test'
    });
    const id = created.headers.get('location').split('/').pop();

    const deleted = await request('DELETE', `/api/restaurants/${id}`);
    const fetched = await request('GET', `/api/restaurants/${id}`);

    assert.strictEqual(deleted.status, 204);
    assert.strictEqual(fetched.status, 404);
});

test('DELETE /api/restaurants/:id unknown -> 404', async () => {
    const res = await request('DELETE', '/api/restaurants/unknown-restaurant');

    assert.strictEqual(res.status, 404);
});

test('GET /api/restaurants/:id/products returns products for the restaurant', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Menu Restaurant'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();

    const emptyMenu = await request('GET', `/api/restaurants/${restaurantId}/products`);
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Falafel',
        description: 'Crispy chickpea balls',
        price: 32.5,
        image: 'data:image/png;base64,test'
    });
    const productId = created.headers.get('location').split('/').pop();
    const menu = await request('GET', `/api/restaurants/${restaurantId}/products`);

    assert.strictEqual(emptyMenu.status, 200);
    assert.deepStrictEqual(emptyMenu.json, []);
    assert.strictEqual(created.status, 201);
    assert.deepStrictEqual(menu.json, [
        {
            id: productId,
            restaurantId,
            name: 'Falafel',
            description: 'Crispy chickpea balls',
            price: 32.5,
            image: 'data:image/png;base64,test'
        }
    ]);
});

test('POST /api/restaurants/:id/products missing name or restaurant -> 400/404', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Error Restaurant'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();

    const missingName = await request('POST', `/api/restaurants/${restaurantId}/products`, {});
    const blankName = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: '   '
    });
    const unknownRestaurant = await request('POST', '/api/restaurants/unknown-restaurant/products', {
        name: 'Falafel'
    });

    assert.strictEqual(missingName.status, 400);
    assert.strictEqual(blankName.status, 400);
    assert.strictEqual(unknownRestaurant.status, 404);
});

test('GET /api/restaurants/:id/products/:pId returns product or 404', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Read Restaurant'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Burger'
    });
    const productId = created.headers.get('location').split('/').pop();

    const fetched = await request('GET', `/api/restaurants/${restaurantId}/products/${productId}`);
    const unknownProduct = await request('GET', `/api/restaurants/${restaurantId}/products/unknown-product`);
    const unknownRestaurant = await request('GET', `/api/restaurants/unknown-restaurant/products/${productId}`);

    assert.strictEqual(fetched.status, 200);
    assert.deepStrictEqual(fetched.json, {
        id: productId,
        restaurantId,
        name: 'Burger',
        description: '',
        price: 0,
        image: null
    });
    assert.strictEqual(unknownProduct.status, 404);
    assert.strictEqual(unknownRestaurant.status, 404);
});

test('PATCH /api/restaurants/:id/products/:pId updates a product', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Patch Restaurant'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Old Name'
    });
    const productId = created.headers.get('location').split('/').pop();

    const patched = await request('PATCH', `/api/restaurants/${restaurantId}/products/${productId}`, {
        name: 'New Name',
        description: 'Updated description',
        price: 44.9,
        image: 'data:image/png;base64,updated'
    });
    const fetched = await request('GET', `/api/restaurants/${restaurantId}/products/${productId}`);

    assert.strictEqual(patched.status, 204);
    assert.strictEqual(fetched.json.name, 'New Name');
    assert.strictEqual(fetched.json.description, 'Updated description');
    assert.strictEqual(fetched.json.price, 44.9);
    assert.strictEqual(fetched.json.image, 'data:image/png;base64,updated');
});

test('PATCH /api/restaurants/:id/products/:pId validates missing name and unknown ids', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Patch Errors'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Patch Error Product'
    });
    const productId = created.headers.get('location').split('/').pop();

    const missingName = await request('PATCH', `/api/restaurants/${restaurantId}/products/${productId}`, {});
    const unknownProduct = await request('PATCH', `/api/restaurants/${restaurantId}/products/unknown-product`, {
        name: 'Updated'
    });
    const unknownRestaurant = await request('PATCH', `/api/restaurants/unknown-restaurant/products/${productId}`, {
        name: 'Updated'
    });

    assert.strictEqual(missingName.status, 400);
    assert.strictEqual(unknownProduct.status, 404);
    assert.strictEqual(unknownRestaurant.status, 404);
});

test('DELETE /api/restaurants/:id/products/:pId removes a product', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Delete Restaurant'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Delete Me'
    });
    const productId = created.headers.get('location').split('/').pop();

    const deleted = await request('DELETE', `/api/restaurants/${restaurantId}/products/${productId}`);
    const fetched = await request('GET', `/api/restaurants/${restaurantId}/products/${productId}`);

    assert.strictEqual(deleted.status, 204);
    assert.strictEqual(fetched.status, 404);
});

test('DELETE /api/restaurants/:id/products/:pId unknown ids -> 404', async () => {
    const restaurant = await request('POST', '/api/restaurants', {
        name: 'Product Delete Errors'
    });
    const restaurantId = restaurant.headers.get('location').split('/').pop();
    const created = await request('POST', `/api/restaurants/${restaurantId}/products`, {
        name: 'Delete Error Product'
    });
    const productId = created.headers.get('location').split('/').pop();

    const unknownProduct = await request('DELETE', `/api/restaurants/${restaurantId}/products/unknown-product`);
    const unknownRestaurant = await request('DELETE', `/api/restaurants/unknown-restaurant/products/${productId}`);

    assert.strictEqual(unknownProduct.status, 404);
    assert.strictEqual(unknownRestaurant.status, 404);
});

test('model view updates do not expose password fields', async () => {
    tcpClient.createUser = async () => '201 Created';
    tcpClient.addView = async () => '204 No Content';
    tcpClient.removeView = async () => '204 No Content';

    const created = await User.createUser({
        username: 'frank',
        password: PASSWORD,
        name: 'Frank'
    });

    const afterAdd = await User.addView(created.id, 'product-1');
    const afterRemove = await User.removeView(created.id, 'product-1');

    assert.strictEqual(afterAdd.passwordHash, undefined);
    assert.strictEqual(afterAdd.passwordSalt, undefined);
    assert.strictEqual(afterRemove.passwordHash, undefined);
    assert.strictEqual(afterRemove.passwordSalt, undefined);
});

test('first model view creates the recommendation user, later new views patch it', async () => {
    const calls = [];
    tcpClient.createUser = async (userId, productId) => {
        calls.push({ command: 'POST', userId, productId });
        return '201 Created';
    };
    tcpClient.addView = async (userId, productId) => {
        calls.push({ command: 'PATCH', userId, productId });
        return '204 No Content';
    };

    const created = await User.createUser({
        username: 'gina',
        password: PASSWORD,
        name: 'Gina'
    });

    await User.addView(created.id, 'product-1');
    await User.addView(created.id, 'product-2');
    await User.addView(created.id, 'product-2');

    assert.deepStrictEqual(calls, [
        { command: 'POST', userId: created.id, productId: 'product-1' },
        { command: 'PATCH', userId: created.id, productId: 'product-2' }
    ]);
});

test('GET restaurant product tracks a view for authenticated users only', async () => {
    const trackedViews = [];
    const originalAddView = User.addView;
    User.addView = async (userId, productId) => {
        trackedViews.push({ userId, productId });
        return { id: userId, views: [productId] };
    };

    try {
        const created = await request('POST', '/api/users', newUser('track-product-user', 'Track Product User'));
        const restaurant = await request('POST', '/api/restaurants', {
            name: 'Tracking Restaurant'
        });
        const restaurantId = restaurant.headers.get('location').split('/').pop();

        const product = await request('POST', `/api/restaurants/${restaurantId}/products`, {
            name: 'Pizza'
        });
        const productId = product.headers.get('location').split('/').pop();

        const anonymousGet = await request('GET', `/api/restaurants/${restaurantId}/products/${productId}`);
        assert.strictEqual(anonymousGet.status, 200);
        assert.deepStrictEqual(trackedViews, []);

        const authedGet = await request(
            'GET',
            `/api/restaurants/${restaurantId}/products/${productId}`,
            undefined,
            { 'user-id': created.json.id }
        );

        assert.strictEqual(authedGet.status, 200);
        assert.deepStrictEqual(trackedViews, [
            { userId: created.json.id, productId }
        ]);
    } finally {
        User.addView = originalAddView;
    }
});
