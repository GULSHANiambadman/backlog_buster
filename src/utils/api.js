import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updatePreferences: (data) => api.put('/auth/preferences', data)
};

export const gamesAPI = {
    getAll: (params) => api.get('/games', { params }),
    scanLocal: (customPaths) => api.post('/games/scan-local', { customPaths }),
    addGame: (data) => api.post('/games', data),
    updateGame: (id, data) => api.put(`/games/${id}`, data),
    deleteGame: (id) => api.delete(`/games/${id}`),
    // Playtime tracking
    startSession: (id) => api.post(`/games/${id}/sessions/start`),
    stopSession: (id) => api.post(`/games/${id}/sessions/stop`),
    getSessions: (id) => api.get(`/games/${id}/sessions`),
    getActiveSession: (id) => api.get(`/games/${id}/sessions/active`),
    updatePlaytime: (id, playTime) => api.put(`/games/${id}/playtime`, { playTime })
};

export const recommendationsAPI = {
    get: () => api.get('/recommendations'),
    getStats: () => api.get('/recommendations/stats')
};
