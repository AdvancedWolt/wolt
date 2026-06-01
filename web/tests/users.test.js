const { test, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const usersRoutes = require('../src/routes/users');

let server;
let base;

before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
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
test('POST /api/users with {name} -> 201 + Location /api/users/:id', async () => {
    const res = await request('POST', '/api/users', { name: 'Alice' });

    assert.strictEqual(res.status, 201);
    const location = res.headers.get('location');
    assert.match(location, /^\/api\/users\/.+/);
    assert.ok(res.json.id, 'response should include the new id');
    assert.strictEqual(res.json.name, 'Alice');
});

test('POST /api/users with missing name -> 400', async () => {
    const res = await request('POST', '/api/users', {});

    assert.strictEqual(res.status, 400);
});

// Story: As a user, I want to fetch my profile to see my details.
test('GET /api/users/:id for existing id -> 200 + JSON', async () => {
    const created = await request('POST', '/api/users', { name: 'Bob' });
    const id = created.json.id;

    const res = await request('GET', `/api/users/${id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.id, id);
    assert.strictEqual(res.json.name, 'Bob');
});

test('GET /api/users/:id for unknown id -> 404', async () => {
    const res = await request('GET', '/api/users/does-not-exist');

    assert.strictEqual(res.status, 404);
});
