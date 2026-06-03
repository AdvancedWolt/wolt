const { test, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const usersRoutes = require('../src/routes/users');
const tokensRoutes = require('../src/routes/tokens');
const restaurantsRoutes = require('../src/routes/restaurants');
const productsRoutes = require('../src/routes/products');
const User = require('../src/models/users');
const { tcpClient } = require('../src/services/tcpClient');

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
    const res = await request('POST', '/api/users', {
        username: 'alice',
        password: 'secret',
        name: 'Alice',
        address: '1 Main St'
    });

    assert.strictEqual(res.status, 201);
    const location = res.headers.get('location');
    assert.match(location, /^\/api\/users\/.+/);
    assert.ok(res.json.id, 'response should include the new id');
    assert.strictEqual(res.json.username, 'alice');
    assert.strictEqual(res.json.name, 'Alice');
    assert.strictEqual(res.json.address, '1 Main St');
    assert.strictEqual(res.json.password, undefined);
    assert.strictEqual(res.json.passwordHash, undefined);
});

test('POST /api/users with missing username -> 400', async () => {
    const res = await request('POST', '/api/users', { password: 'secret' });

    assert.strictEqual(res.status, 400);
});

test('POST /api/users with missing password -> 400', async () => {
    const res = await request('POST', '/api/users', { username: 'no-password' });

    assert.strictEqual(res.status, 400);
});

// Story: As a user, I want to fetch my profile to see my details.
test('GET /api/users/:id for existing id -> 200 + JSON', async () => {
    const created = await request('POST', '/api/users', {
        username: 'bob',
        password: 'secret',
        name: 'Bob'
    });
    const id = created.json.id;
    const token = await request('POST', '/api/tokens', {
        username: 'bob',
        password: 'secret'
    });
    const cookie = token.headers.get('set-cookie').split(';')[0];

    const res = await request('GET', `/api/users/${id}`, undefined, { Cookie: cookie });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.id, id);
    assert.strictEqual(res.json.username, 'bob');
    assert.strictEqual(res.json.name, 'Bob');
    assert.strictEqual(res.json.password, undefined);
    assert.strictEqual(res.json.passwordHash, undefined);
});

test('GET /api/users/:id for an id owned by another token -> 403', async () => {
    const created = await request('POST', '/api/users', {
        username: 'unknown-checker',
        password: 'secret',
        name: 'Unknown Checker'
    });
    const token = await request('POST', '/api/tokens', {
        username: 'unknown-checker',
        password: 'secret'
    });

    const res = await request(
        'GET',
        '/api/users/does-not-exist',
        undefined,
        { Authorization: `Bearer ${token.json.token}` }
    );

    assert.strictEqual(res.status, 403);
    assert.ok(created.json.id);
});

test('POST /api/tokens with valid credentials -> 201 + token', async () => {
    const created = await request('POST', '/api/users', {
        username: 'carol',
        password: 'secret',
        name: 'Carol'
    });

    const res = await request('POST', '/api/tokens', {
        username: 'carol',
        password: 'secret'
    });

    assert.strictEqual(res.status, 201);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.userId, created.json.id);
    assert.match(res.headers.get('set-cookie'), /^token=/);
});

test('POST /api/tokens with invalid credentials -> 401', async () => {
    await request('POST', '/api/users', {
        username: 'dave',
        password: 'secret',
        name: 'Dave'
    });

    const res = await request('POST', '/api/tokens', {
        username: 'dave',
        password: 'wrong'
    });

    assert.strictEqual(res.status, 401);
});

test('GET /api/users/:id without token -> 401', async () => {
    const created = await request('POST', '/api/users', {
        username: 'henry',
        password: 'secret',
        name: 'Henry'
    });

    const res = await request('GET', `/api/users/${created.json.id}`);

    assert.strictEqual(res.status, 401);
});

test('GET /api/users/:id with another user token -> 403', async () => {
    const first = await request('POST', '/api/users', {
        username: 'iris',
        password: 'secret',
        name: 'Iris'
    });
    await request('POST', '/api/users', {
        username: 'jane',
        password: 'secret',
        name: 'Jane'
    });
    const token = await request('POST', '/api/tokens', {
        username: 'jane',
        password: 'secret'
    });

    const res = await request(
        'GET',
        `/api/users/${first.json.id}`,
        undefined,
        { Authorization: `Bearer ${token.json.token}` }
    );

    assert.strictEqual(res.status, 403);
});

test('GET /api/users/:id/recommendations with own cookie -> 200', async () => {
    tcpClient.getRecommendations = async () => 'product-2 product-3';

    const created = await request('POST', '/api/users', {
        username: 'kate',
        password: 'secret',
        name: 'Kate'
    });
    const token = await request('POST', '/api/tokens', {
        username: 'kate',
        password: 'secret'
    });
    const cookie = token.headers.get('set-cookie').split(';')[0];

    const res = await request(
        'GET',
        `/api/users/${created.json.id}/recommendations?productId=product-1`,
        undefined,
        { Cookie: cookie }
    );

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.json, { recommendations: 'product-2 product-3' });
});

test('GET /api/users/:id/recommendations with another user token -> 403', async () => {
    const first = await request('POST', '/api/users', {
        username: 'leo',
        password: 'secret',
        name: 'Leo'
    });
    await request('POST', '/api/users', {
        username: 'maya',
        password: 'secret',
        name: 'Maya'
    });
    const token = await request('POST', '/api/tokens', {
        username: 'maya',
        password: 'secret'
    });

    const res = await request(
        'GET',
        `/api/users/${first.json.id}/recommendations?productId=product-1`,
        undefined,
        { Authorization: `Bearer ${token.json.token}` }
    );

    assert.strictEqual(res.status, 403);
});

test('direct user view routes are not exposed', async () => {
    const created = await request('POST', '/api/users', {
        username: 'erin',
        password: 'secret',
        name: 'Erin'
    });

    const res = await request('POST', `/api/users/${created.json.id}/views`, { productId: 'p1' });

    assert.strictEqual(res.status, 404);
});

test('model view updates do not expose password fields', async () => {
    tcpClient.createUser = async () => '201 Created';
    tcpClient.addView = async () => '204 No Content';
    tcpClient.removeView = async () => '204 No Content';

    const created = User.createUser({
        username: 'frank',
        password: 'secret',
        name: 'Frank'
    });

    const afterAdd = await User.addView(created.id, 'product-1');
    const afterRemove = await User.removeView(created.id, 'product-1');

    assert.strictEqual(afterAdd.passwordHash, undefined);
    assert.strictEqual(afterAdd.passwordSalt, undefined);
    assert.strictEqual(afterRemove.passwordHash, undefined);
    assert.strictEqual(afterRemove.passwordSalt, undefined);
});

test('first model view creates the recommendation user, later views patch it', async () => {
    const calls = [];
    tcpClient.createUser = async (userId, productId) => {
        calls.push({ command: 'POST', userId, productId });
        return '201 Created';
    };
    tcpClient.addView = async (userId, productId) => {
        calls.push({ command: 'PATCH', userId, productId });
        return '204 No Content';
    };

    const created = User.createUser({
        username: 'gina',
        password: 'secret',
        name: 'Gina'
    });

    await User.addView(created.id, 'product-1');
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
        const created = await request('POST', '/api/users', {
            username: 'track-product-user',
            password: 'secret',
            name: 'Track Product User'
        });
        const token = await request('POST', '/api/tokens', {
            username: 'track-product-user',
            password: 'secret'
        });
        const cookie = token.headers.get('set-cookie').split(';')[0];

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
            { Cookie: cookie }
        );

        assert.strictEqual(authedGet.status, 200);
        assert.deepStrictEqual(trackedViews, [
            { userId: created.json.id, productId }
        ]);
    } finally {
        User.addView = originalAddView;
    }
});
