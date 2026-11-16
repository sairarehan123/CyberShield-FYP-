// OPTIONAL FILE -- NOT yet added to your frontend. Copy to  fyp-frontend/src/services/api.js  after you approve.
// It is a plain helper: it adds no UI and changes no existing component.
import { Platform } from 'react-native';

// Pick the URL that matches HOW you run the app (see README -> "Backend URL for each environment").
//   Android emulator : http://10.0.2.2:4000
//   iOS simulator    : http://localhost:4000
//   Expo Web         : http://localhost:4000
//   Physical phone   : http://<YOUR-PC-LAN-IP>:4000   (phone and PC on the same Wi-Fi)
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error('Cannot reach the server. Check your connection and try again.');
    err.code = 'NETWORK_ERROR';
    throw err;
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const err = new Error(json?.error?.message || 'Something went wrong. Please try again.');
    err.code = json?.error?.code;
    err.fields = json?.error?.fields; // keys: name, email, password, confirm  (match your form state)
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export const api = {
  register: ({ name, email, password, confirm }) => request('/api/auth/register', { method: 'POST', body: { name, email, password, confirm } }),
  login: ({ email, password }) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  refresh: (refreshToken) => request('/api/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: (accessToken) => request('/api/auth/logout', { method: 'POST', token: accessToken }),
  getProfile: (accessToken) => request('/api/profile', { token: accessToken }),
  updateProfile: (accessToken, changes) => request('/api/profile', { method: 'PATCH', token: accessToken, body: changes }),
};
