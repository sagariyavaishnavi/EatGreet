import axios from 'axios';

const API_BASE_URL = 'https://eatgreet.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    updatePassword: (passwordData) => api.put('/auth/password', passwordData),
    getRestaurants: () => api.get('/auth/restaurants')
};

export const menuAPI = {
    getAll: () => api.get('/menu'),
    create: (itemData) => api.post('/menu', itemData),
    update: (id, itemData) => api.put(`/menu/${id}`, itemData),
    delete: (id) => api.delete(`/menu/${id}`)
};

export const categoryAPI = {
    getAll: () => api.get('/categories'),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`)
};

export const statsAPI = {
    getAdminStats: () => api.get('/stats/admin'),
    getSuperAdminStats: () => api.get('/stats/super-admin')
};

export default api;
