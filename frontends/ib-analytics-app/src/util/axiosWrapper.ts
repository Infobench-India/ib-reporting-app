import axios from 'axios';
const VITE_MES_API_URL = import.meta.env.VITE_MES_API_URL;
const API = axios.create({
  baseURL: VITE_MES_API_URL ? VITE_MES_API_URL + "/api" : "http://localhost:5002/api",
  headers: {
    "Content-type": "application/json"
  },
});

// Add request interceptor to include companyID in headers
API.interceptors.request.use((config) => {
  try {
    // Try local storage first (standalone), then host store (integrated)
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken && (window as any).__HOST_STORE__) {
      accessToken = (window as any).__HOST_STORE__.getState().auth.accessToken;
      console.log('[API] Token from host store:', accessToken ? 'found' : 'not found');
    } else if (accessToken) {
      console.log('[API] Token from localStorage:', 'found');
    } else {
      console.log('[API] No token found');
    }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const selectedCompany = localStorage.getItem('selectedCompany');
    if (selectedCompany) {
      const company = JSON.parse(selectedCompany);
      config.headers['Company-Id'] = company.id;
    }
  } catch (error) {
    console.error('Error parsing selectedCompany or token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
