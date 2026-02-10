import axios from 'axios';
const  VITE_MES_API_URL  = import.meta.env.VITE_MES_API_URL;
const API = axios.create({
  baseURL: VITE_MES_API_URL?VITE_MES_API_URL+"/api":"http://localhost:5002/api",
  headers: {
    "Content-type": "application/json"
  },
});

// Add request interceptor to include companyID in headers
API.interceptors.request.use((config) => {
  try {
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (selectedCompany) {
      const company = JSON.parse(selectedCompany);
      config.headers['Company-Id'] = company.id;
    }
  } catch (error) {
    console.error('Error parsing selectedCompany from sessionStorage:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
