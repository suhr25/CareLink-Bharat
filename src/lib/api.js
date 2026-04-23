import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory on every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try refreshing the access token once then retry
let isRefreshing = false;
let pendingRequests = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = data.data.accessToken;
      sessionStorage.setItem('accessToken', newToken);
      pendingRequests.forEach((p) => p.resolve(newToken));
      pendingRequests = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      pendingRequests.forEach((p) => p.reject(error));
      pendingRequests = [];
      sessionStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
