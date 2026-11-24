// Smoke tests that DO NOT need a real Supabase project.
// They only cover behaviour that is decided before any Supabase call is made
// (validation, auth-required checks, JSON parsing, 404, health).
// They do NOT prove that registration, login, logout or profile work against Supabase.
process.env.SUPABASE_URL = 'https://dummy-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'dummy-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-key';
process.env.CORS_ORIGINS = 'http://localhost:8081';
process.env.NODE_ENV = 'test';

const http = require('http');
const assert = require('assert');
const app = require('../src/app');

const server = http.createServer(app).listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, { body, headers = {}, raw } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body || raw ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: raw !== undefined ? raw : body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  };

  const tests = [];
  const test = (name, fn) => tests.push({ name, fn });

  test('GET /api/health -> 200', async () => {
    const r = await call('GET', '/api/health');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.json.data.status, 'ok');
  });
  test('register with empty body -> 400 with all four field errors', async () => {
    const r = await call('POST', '/api/auth/register', { body: {} });
    assert.strictEqual(r.status, 400);
    assert.deepStrictEqual(Object.keys(r.json.error.fields).sort(), ['confirm', 'email', 'name', 'password']);
  });
  test('register with bad email -> 400 (email)', async () => {
    const r = await call('POST', '/api/auth/register', { body: { name: 'Amna', email: 'nope', password: 'abcdefgh', confirm: 'abcdefgh' } });
    assert.strictEqual(r.status, 400);
    assert.ok(r.json.error.fields.email);
  });
  test('register with short password -> 400 (password)', async () => {
    const r = await call('POST', '/api/auth/register', { body: { name: 'Amna', email: 'a@b.co', password: 'short', confirm: 'short' } });
    assert.strictEqual(r.status, 400);
    assert.ok(r.json.error.fields.password);
  });
  test('register with mismatched confirm -> 400 (confirm)', async () => {
    const r = await call('POST', '/api/auth/register', { body: { name: 'Amna', email: 'a@b.co', password: 'abcdefgh', confirm: 'abcdefgX' } });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.json.error.fields.confirm, 'Passwords do not match.');
  });
  test('login with empty body -> 400 (email + password)', async () => {
    const r = await call('POST', '/api/auth/login', { body: {} });
    assert.strictEqual(r.status, 400);
    assert.ok(r.json.error.fields.email && r.json.error.fields.password);
  });
  test('GET /api/profile without token -> 401', async () => {
    const r = await call('GET', '/api/profile');
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.json.error.code, 'UNAUTHORIZED');
  });
  test('PATCH /api/profile without token -> 401', async () => {
    const r = await call('PATCH', '/api/profile', { body: { name: 'X' } });
    assert.strictEqual(r.status, 401);
  });
  test('POST /api/auth/logout without token -> 401', async () => {
    const r = await call('POST', '/api/auth/logout');
    assert.strictEqual(r.status, 401);
  });
  test('malformed Authorization header -> 401', async () => {
    const r = await call('GET', '/api/profile', { headers: { Authorization: 'Token abc' } });
    assert.strictEqual(r.status, 401);
  });
  test('invalid JSON body -> 400 INVALID_JSON', async () => {
    const r = await call('POST', '/api/auth/login', { raw: '{bad json' });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.json.error.code, 'INVALID_JSON');
  });
  test('unknown route -> 404', async () => {
    const r = await call('GET', '/api/nope');
    assert.strictEqual(r.status, 404);
  });
  test('disallowed browser origin -> 403', async () => {
    const r = await call('GET', '/api/health', { headers: { Origin: 'http://evil.example' } });
    assert.strictEqual(r.status, 403);
  });
  test('allowed browser origin -> 200', async () => {
    const r = await call('GET', '/api/health', { headers: { Origin: 'http://localhost:8081' } });
    assert.strictEqual(r.status, 200);
  });

  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`PASS  ${t.name}`);
    } catch (e) {
      failed++;
      console.log(`FAIL  ${t.name}\n      ${e.message}`);
    }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  server.close();
  process.exit(failed ? 1 : 0);
});
