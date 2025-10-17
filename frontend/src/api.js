import axios from 'axios';

// Base API instance. In dev, CRA proxy forwards to http://localhost:4000.
// In prod, src/server.js proxies /api to BACKEND_URL.
const api = axios.create({
  baseURL: '/api',
});

// Optional auth header helper
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { localStorage.setItem('lr_token', token); } catch {}
  } else {
    delete api.defaults.headers.common['Authorization'];
    try { localStorage.removeItem('lr_token'); } catch {}
  }
}

// Load token on boot if present
try {
  const t = localStorage.getItem('lr_token');
  if (t) setAuthToken(t);
} catch {}

// Redirect to sign-in on 401s
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try { setAuthToken(null); } catch {}
      if (typeof window !== 'undefined') window.location.replace('/signin');
    } else if (status === 403) {
      if (typeof window !== 'undefined') window.location.replace('/dashboard');
    }
    return Promise.reject(err);
  }
);

export default api;
