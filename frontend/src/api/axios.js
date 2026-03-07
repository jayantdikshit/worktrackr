import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Aapka backend port yahan aayega
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