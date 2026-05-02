import axios from 'axios';

const API = axios.create({
    // Agar environment variable milta hai toh wo use hoga, nahi toh Render wala live link
    baseURL: process.env.REACT_APP_API_URL || 'https://work-trackr.onrender.com/api',
});

// Har request ke saath token bhejne ke liye
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;