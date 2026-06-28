const { test } = require('node:test');
const assert = require('node:assert');

// These tests exercise the Mongoose schemas with validateSync(), which runs the
// schema-level validators in memory and needs no MongoDB connection.
const { User, Restaurant, Product, Order, ORDER_STATUSES } = require('../src/models/schemas');

test('User requires username and the password-rule fields', () => {
    const err = new User({}).validateSync();
    assert.ok(err, 'expected a validation error');
    assert.ok(err.errors.username, 'username should be required');
    assert.ok(err.errors.passwordHash, 'passwordHash should be required');
    assert.ok(err.errors.passwordSalt, 'passwordSalt should be required');
});

test('User role is restricted to the known roles', () => {
    const err = new User({
        username: 'a',
        passwordHash: 'h',
        passwordSalt: 's',
        role: 'admin',
    }).validateSync();
    assert.ok(err && err.errors.role, 'invalid role should fail the enum');
});

test('A fully-populated User validates and defaults role to customer', () => {
    const user = new User({ username: 'a', passwordHash: 'h', passwordSalt: 's' });
    assert.strictEqual(user.validateSync(), undefined);
    assert.strictEqual(user.role, 'customer');
    assert.ok(typeof user._id === 'string' && user._id.length > 0, '_id is a generated string');
});

test('Restaurant requires a name and defaults category/promoted', () => {
    assert.ok(new Restaurant({}).validateSync().errors.name, 'name should be required');

    const r = new Restaurant({ name: 'Sakura', owner: 'u1' });
    assert.strictEqual(r.validateSync(), undefined);
    assert.strictEqual(r.category, 'Other');
    assert.strictEqual(r.promoted, false);
});

test('Product requires a restaurant and name, and rejects a negative price', () => {
    const err = new Product({}).validateSync();
    assert.ok(err.errors.restaurant, 'restaurant should be required');
    assert.ok(err.errors.name, 'name should be required');

    const negative = new Product({ restaurant: 'r1', name: 'Roll', price: -1 }).validateSync();
    assert.ok(negative && negative.errors.price, 'negative price should fail min');

    assert.strictEqual(new Product({ restaurant: 'r1', name: 'Roll' }).validateSync(), undefined);
});

test('Order requires user and restaurant and enforces the status enum', () => {
    const missing = new Order({}).validateSync();
    assert.ok(missing.errors.user, 'user should be required');
    assert.ok(missing.errors.restaurant, 'restaurant should be required');

    const bad = new Order({ user: 'u1', restaurant: 'r1', status: 'foo' }).validateSync();
    assert.ok(bad && bad.errors.status, 'unknown status should fail the enum');

    const order = new Order({ user: 'u1', restaurant: 'r1' });
    assert.strictEqual(order.validateSync(), undefined);
    assert.strictEqual(order.status, 'pending');
    assert.deepStrictEqual([...ORDER_STATUSES], ['pending', 'in-progress', 'delivered', 'cancelled']);
});

test('Relations are indexed on the fields we look up by', () => {
    const indexedPaths = (model) => model.schema.indexes().map(([fields]) => Object.keys(fields)[0]);

    assert.ok(indexedPaths(Product).includes('restaurant'), 'Product.restaurant is indexed');
    assert.ok(indexedPaths(Order).includes('user'), 'Order.user is indexed');
    assert.ok(indexedPaths(Order).includes('restaurant'), 'Order.restaurant is indexed');
    assert.ok(indexedPaths(Restaurant).includes('owner'), 'Restaurant.owner is indexed');
    // username carries a unique index, declared inline on the path.
    assert.ok(User.schema.path('username').options.unique, 'User.username is unique');
});
