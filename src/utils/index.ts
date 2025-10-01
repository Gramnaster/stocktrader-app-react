import axios from "axios";

// Use proxy in development, full URL in production
const isDevelopment = import.meta.env.DEV;
const productionUrl = import.meta.env.VITE_API_URL;
const baseURL = isDevelopment ? '/api/v1' : productionUrl;

export const customFetch = axios.create({
  baseURL: baseURL,
});

console.log('API Base URL:', baseURL);

customFetch.defaults.headers.common['Accept'] = '*/*';
// Temporarily comment out Content-Type to avoid preflight
// customFetch.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to automatically include Authorization header
customFetch.interceptors.request.use(
  (config) => {
    // Get user from localStorage if available
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          // Token already includes "Bearer " prefix from the backend response
          config.headers['Authorization'] = user.token;
          console.log('Interceptor: Added Authorization header via proxy');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);