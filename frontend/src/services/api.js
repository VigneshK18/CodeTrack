const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function getToken() {
  return localStorage.getItem('codetrack_token');
}

export function saveAuth(data) {
  localStorage.setItem('codetrack_token', data.token);
  localStorage.setItem('codetrack_user', JSON.stringify({
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role
  }));
}

export function clearAuth() {
  localStorage.removeItem('codetrack_token');
  localStorage.removeItem('codetrack_user');
}

export function getStoredUser() {
  const user = localStorage.getItem('codetrack_user');
  return user ? JSON.parse(user) : null;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let message = 'Request failed';
    if (data) {
      if (typeof data === 'object') {
        if (data.message) {
          message = data.message;
        } else {
          // Handle Spring validation errors (Map of field: error)
          message = Object.entries(data)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
        }
      } else {
        message = data;
      }
    }
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body || {}) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' })
};
