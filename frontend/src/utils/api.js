import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';


const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        // Add restaurantName for tenant resolution
        if (user.restaurantName) {
          config.headers['x-restaurant-name'] = user.restaurantName;
          config.params = { ...config.params, restaurantName: user.restaurantName };
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  updatePassword: () => Promise.resolve({ data: { message: 'Password update not implemented yet' } }), // Pending backend
  getRestaurants: () => api.get('/restaurant/all'),
};

export const statsAPI = {
  getAdminStats: async () => {
    return api.get('/stats/admin');
  },
  getSuperAdminStats: async () => {
    return api.get('/stats/super-admin');
  }
};

export const paymentAPI = {
  getAll: () => api.get('/payments'),
};

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }), // params can contain restaurantId
  create: (itemData) => api.post('/menu', itemData),
  update: (id, itemData) => api.put(`/menu/${id}`, itemData),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orderAPI = {
  getOrders: () => api.get('/orders'),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

/* 
   CUSTOMER / OTHER FLOWS
*/
export const customerAPI = {
  // Customers use the same auth endpoints but different flows in frontend potentially
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', { ...data, role: 'customer' }),
  getProfile: () => api.get('/auth/profile'),
};

export const restaurantAPI = {
  getDetails: () => api.get('/restaurant'),
  updateDetails: (details) => api.put('/restaurant', details),
};

export const uploadAPI = {
  uploadFile: (fileOrFormData) => {
    let data = fileOrFormData;
    if (fileOrFormData instanceof File) {
      data = new FormData();
      data.append('file', fileOrFormData);
    }
    return api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDirect: (fileOrFormData, onUploadProgress) => {
    let data = fileOrFormData;
    if (fileOrFormData instanceof File) {
      data = new FormData();
      data.append('file', fileOrFormData);
    }
    return api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      }
    });
  },
};

const apis = {
  authAPI,
  statsAPI,
  menuAPI,
  categoryAPI,
  orderAPI,
  customerAPI,
  restaurantAPI,
  uploadAPI
};

export default apis;
