import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
apiClient.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mockUser = {
  _id: 'mock-user-id',
  name: 'Frontend Designer',
  email: 'design@eatgreet.com',
  role: 'admin',
  token: 'mock-jwt-token'
};

/* 
   REAL APIs 
*/
/* 
   REAL APIs 
*/
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response; // Return full Axios response object
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error("Register API Error:", error);
      throw error;
    }
  },
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },
  updateProfile: async (userData) => {
    return apiClient.put('/auth/profile', userData);
  },
  updatePassword: async (data) => {
    return apiClient.put('/auth/password', data);
  },
  getRestaurants: async () => {
    // Super Admin endpoint to list restaurants
    return apiClient.get('/auth/restaurants');
  }
};

export const statsAPI = {
  getAdminStats: async () => {
    return apiClient.get('/stats/admin');
  },
  getSuperAdminStats: async () => {
    return apiClient.get('/stats/super-admin');
  }
};

export const menuAPI = {
  getAll: async () => {
    return apiClient.get('/menu');
  },
  create: async (itemData) => {
    return apiClient.post('/menu', itemData);
  },
  update: async (id, itemData) => {
    return apiClient.put(`/menu/${id}`, itemData);
  },
  delete: async (id) => {
    return apiClient.delete(`/menu/${id}`);
  }
};

export const categoryAPI = {
  getAll: async () => {
    return apiClient.get('/categories');
  },
  create: async (categoryData) => {
    return apiClient.post('/categories', categoryData);
  },
  update: async (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },
  delete: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};

export const orderAPI = {
  getOrders: async () => {
    return apiClient.get('/orders');
  },
  create: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },
  updateStatus: async (orderId, status) => {
    return apiClient.put(`/orders/${orderId}/status`, { status });
  }
};

/* 
   MOCKED APIs (Preserved for Customer/Restaurant specific flows not fully integrated yet)
*/

export const customerAPI = {
  login: async (credentials) => {
    await mockDelay();
    return { data: { ...mockUser, role: 'customer' } };
  },
  register: async (data) => {
    await mockDelay();
    return { data: { ...mockUser, ...data, role: 'customer' } };
  },
  getProfile: async () => {
    await mockDelay();
    return { data: mockUser };
  }
};

export const restaurantAPI = {
  getDetails: async () => {
    await mockDelay();
    return { data: {} };
  },
  updateDetails: async (details) => {
    await mockDelay();
    return { data: details };
  }
};

export const uploadAPI = {
  uploadFile: async () => {
    await mockDelay();
    return { data: { url: 'https://via.placeholder.com/150' } };
  },
  uploadDirect: async () => {
    await mockDelay();
    return { data: { url: 'https://via.placeholder.com/150' } };
  }
};

export default {
  authAPI,
  statsAPI,
  menuAPI,
  categoryAPI,
  orderAPI,
  customerAPI,
  restaurantAPI,
  uploadAPI
};
