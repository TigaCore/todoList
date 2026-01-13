import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Helper to determine the correct API URL based on the environment
const getBaseUrl = () => {
    // 1. Allow override via environment variable (useful for real devices/production)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const platform = Capacitor.getPlatform();

    // 2. Android Emulator specific address (maps to host localhost)
    if (platform === 'android') {
        return 'http://10.0.2.2:8000/api';
    }

    // 3. Web: Use relative path to leverage Vite proxy
    if (platform === 'web') {
        return '/api';
    }

    // 4. iOS or other native platforms (fallback)
    // For physical devices, VITE_API_URL should be set
    return 'http://localhost:8000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
