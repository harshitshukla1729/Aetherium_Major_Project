import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // or 5000 if backend runs there
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // adjust if you store elsewhere
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
