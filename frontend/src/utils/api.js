import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
    getAll: (restaurantId) => api.get('/menu', { params: { restaurantId } }),
    create: (itemData) => api.post('/menu', itemData),
    update: (id, itemData) => api.put(`/menu/${id}`, itemData),
    delete: (id) => api.delete(`/menu/${id}`)
};

export const categoryAPI = {
    getAll: (restaurantId) => api.get('/categories', { params: { restaurantId } }),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`)
};

export const statsAPI = {
    getAdminStats: () => api.get('/stats/admin'),
    getSuperAdminStats: () => api.get('/stats/super-admin')
};

export const orderAPI = {
    getOrders: (restaurantId) => api.get('/orders', { params: { restaurantId } }),
    create: (orderData) => api.post('/orders', orderData),
    updateStatus: (id, status) => api.put(`/orders/${id}`, { status })
};

export const restaurantAPI = {
    getDetails: (restaurantId) => api.get(`/restaurant/${restaurantId}`),
    updateDetails: (details) => api.put('/restaurant', details)
};

export const uploadAPI = {
    uploadFile: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadDirect: async (file, onProgress) => {
        // 1. Get Signature from backend
        const { data: sigData } = await api.get('/upload/signature');

        // 2. Prepare FormData for Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        // 3. Upload directly to Cloudinary
        const cloudUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
        return axios.post(cloudUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
    }
};

export default api;
