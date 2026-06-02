const { test, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const usersRoutes = require('../src/routes/users');
const tokensRoutes = require('../src/routes/tokens');
const User = require('../src/models/users');
const { tcpClient } = require('../src/services/tcpClient');

let server;
let base;

before(async () => {
    const app = express();
    app.use(express.json());
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

const request = async (method, path, body) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
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

    const res = await request('GET', `/api/users/${id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.id, id);
    assert.strictEqual(res.json.username, 'bob');
    assert.strictEqual(res.json.name, 'Bob');
    assert.strictEqual(res.json.password, undefined);
    assert.strictEqual(res.json.passwordHash, undefined);
});

test('GET /api/users/:id for unknown id -> 404', async () => {
    const res = await request('GET', '/api/users/does-not-exist');

    assert.strictEqual(res.status, 404);
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
