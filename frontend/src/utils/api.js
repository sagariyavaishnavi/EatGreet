import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';


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
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        // Add restaurantName for tenant resolution, but don't override if already set in params or headers
        if (user && user.restaurantName) {
          if (!config.headers['x-restaurant-name'] && !config.params?.restaurantName) {
            config.headers['x-restaurant-name'] = user.restaurantName;
          }
          if (!config.params?.restaurantName && !config.headers['x-restaurant-name']) {
            config.params = { ...config.params, restaurantName: user.restaurantName };
          }
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        // Clear corrupt data to prevent repeated crashes
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle session expiration or database resolution errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: Unauthorized / Session Expired
    // 400 with specific message: Tenant/Restaurant resolution failed
    if (error.response) {
      const isAuthError = error.response.status === 401;
      const isTenantError = error.response.status === 400 &&
        error.response.data?.message?.toLowerCase().includes('restaurant name');

      if (isAuthError || isTenantError) {
        console.warn("Session or Tenant error detected. Redirecting to login...", error.response.data);
        localStorage.clear();
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
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
  getAdminStats: async (params) => {
    return api.get('/stats/admin', { params });
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
  getOrders: (params) => api.get('/orders', { params }),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updateItemStatus: (orderId, itemIdx, status) => api.put(`/orders/${orderId}/items/${itemIdx}/status`, { status }),
  checkTableStatus: (tableNumber, restaurantName) => api.get(`/orders/table-status/${tableNumber}`, { params: { restaurantName } }),

  // Public Kitchen API
  getKitchenOrders: (restaurantName) => api.get(`/orders/kitchen/${restaurantName}`),
  updateKitchenOrderStatus: (restaurantName, orderId, status) => api.put(`/orders/kitchen/${restaurantName}/${orderId}/status`, { status }),
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
  getBySlug: (slug) => api.get(`/restaurant/slug/${slug}`),
  getPublicDetails: (id) => api.get(`/restaurant/${id}`),
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
  uploadDirect: async (fileOrFormData, onUploadProgress, config = {}) => {
    let file = fileOrFormData;
    if (fileOrFormData instanceof FormData) {
      file = fileOrFormData.get('file');
    }

    try {
      // 1. Get Signature from Backend
      const signRes = await api.get('/upload/signature', config); // Pass signal to signature request too
      const { signature, timestamp, folder, cloudName, apiKey } = signRes.data;

      // 2. Prepare Direct Upload Data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      // 3. Upload Directly to Cloudinary
      // Note: We use a naked axios instance to avoid sending our Backend Auth Headers to Cloudinary
      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (onUploadProgress) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(percentCompleted);
            }
          },
          ...config // Pass cancellation signal
        }
      );

      return cloudinaryRes; // Cloudinary returns { data: { secure_url, ... } } which matches our expectation
    } catch (error) {
      // Don't log if it's just a cancellation
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error("Direct Upload Error", error);
      }
      throw error;
    }
  },
  cleanupFiles: (publicIds) => api.post('/upload/cleanup', { publicIds }),
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
