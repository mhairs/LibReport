// Simple signup/login test against running backend
// Usage: node scripts/test-auth.js [baseUrl]
// Default baseUrl: http://localhost:4000

const axios = require('axios');

async function main() {
  const base = process.argv[2] || 'http://localhost:4000';
  const api = axios.create({ baseURL: `${base}/api`, timeout: 10000 });

  // Health
  const health = await api.get('/health').then(r => r.data).catch(e => ({ ok: false, error: e.message }));
  if (!health.ok) throw new Error(`Backend not healthy at ${base}/api/health: ${health.error || 'unknown'}`);
  console.log('Health OK');

  // Unique email per run
  const n = Math.floor(Math.random() * 1e6);
  const email = `test${n}@example.com`;
  const studentId = `10-2024-${String(n).padStart(6, '0')}`;

  // Signup
  const signupBody = {
    studentId,
    email,
    fullName: 'Test User',
    password: 'Password123',
    confirmPassword: 'Password123'
  };

  const signup = await api.post('/auth/signup', signupBody).then(r => r.data).catch(e => {
    const status = e?.response?.status;
    const msg = e?.response?.data?.error || e.message;
    throw new Error(`Signup failed (${status || 'network'}): ${msg}`);
  });
  console.log('Signup OK:', signup.user?.email);

  const token = signup.token;
  if (!token) throw new Error('No token returned from signup');

  // Login
  const login = await api.post('/auth/login', { email, password: 'Password123' }).then(r => r.data).catch(e => {
    const status = e?.response?.status;
    const msg = e?.response?.data?.error || e.message;
    throw new Error(`Login failed (${status || 'network'}): ${msg}`);
  });
  console.log('Login OK:', login.user?.email);
}

main().catch(err => { console.error(err.message); process.exit(1); });

