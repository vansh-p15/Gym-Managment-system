const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getToken = () => localStorage.getItem('token');

const headers = (isJson = true) => {
  const h = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (isJson) h['Content-Type'] = 'application/json';
  return h;
};

const parseResponseBody = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const handleResponse = async (res) => {
  const data = await parseResponseBody(res);
  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
};

const normalizeRequestError = (error) => {
  const msg = error?.message || '';
  if (msg.includes('expected pattern') || msg.includes('Invalid URL')) {
    return new Error('API URL configuration issue. Please check frontend API base URL and server URL.');
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
    return new Error('Cannot connect to server. Start backend with "npm run server" and try again.');
  }
  return error instanceof Error ? error : new Error('Something went wrong');
};

const request = async (url, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${url}`, options);
    return handleResponse(res);
  } catch (error) {
    throw normalizeRequestError(error);
  }
};

const api = {
  get: (url) => request(url, { headers: headers(false) }),
  post: (url, body) => request(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE', headers: headers(false) }),
};

export default api;
