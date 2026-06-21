// One source for the JWT signing secret, shared by the login controller and the
// auth middleware. A real deployment would supply JWT_SECRET via the environment.
const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';

module.exports = { JWT_SECRET };
