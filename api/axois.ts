import axios from 'axios';

// This pulls the URL from your .env file automatically
// const API_URL = (import.meta as any).env?.BACKEND_URL;
const API_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true 
});

export default api;