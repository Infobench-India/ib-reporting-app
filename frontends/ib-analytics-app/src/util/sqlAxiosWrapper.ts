import axios from 'axios';
const SQL_API_BASE_URL = import.meta.env.VITE_SQL_API_BASE_URL + "/api" || "http://localhost:3052/api"; // Use your environment variable for the base URL

// Assuming the SQL Report Server runs on port 3052 as per .env created earlier
// const SQL_API_BASE_URL = "http://localhost:3052/api";

const SQL_API = axios.create({
    baseURL: SQL_API_BASE_URL,
    headers: {
        "Content-type": "application/json"
    },
});

// Add request interceptor to include companyID in headers if needed
SQL_API.interceptors.request.use((config) => {
    try {
        // Try local storage first (standalone), then host store (integrated)
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken && (window as any).__HOST_STORE__) {
            accessToken = (window as any).__HOST_STORE__.getState().auth.accessToken;
            console.log('[SQL_API] Token from host store:', accessToken ? 'found' : 'not found');
        } else if (accessToken) {
            console.log('[SQL_API] Token from localStorage:', 'found');
        } else {
            console.log('[SQL_API] No token found');
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

export default SQL_API;
