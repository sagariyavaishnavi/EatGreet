// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';

/**
 * MOCKED API for Frontend Design Phase
 * Backend disconnected.
 */

const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mockUser = {
  _id: 'mock-user-id',
  name: 'Frontend Designer',
  email: 'design@eatgreet.com',
  role: 'admin', // Default to admin to see dashboard
  token: 'mock-jwt-token'
};

export const authAPI = {
  login: async (credentials) => {
    await mockDelay();
    console.log('Mock Login with:', credentials);
    // Simulate success
    // Return mockUser directly as data (it includes token and role)
    return { data: mockUser };
  },
  register: async (userData) => {
    await mockDelay();
    console.log('Mock Register with:', userData);
    return { data: { ...mockUser, ...userData } };
  },
  getProfile: async () => {
    await mockDelay();
    return { data: mockUser };
  },
  updateProfile: async (userData) => {
    await mockDelay();
    return { data: { ...mockUser, ...userData } };
  },
  updatePassword: async () => {
    await mockDelay();
    return { data: { message: 'Password updated' } };
  },
  getRestaurants: async () => {
    await mockDelay();
    return { data: [] }; // No static data
  }
};

export const statsAPI = {
  getAdminStats: async () => {
    await mockDelay();
    return { data: { totalOrders: 0, totalSales: 0, activeMenu: 0 } };
  },
  getSuperAdminStats: async () => {
    await mockDelay();
    return {
      data: {
        totalRestaurants: 12,
        activeSubscriptions: 10,
        monthlyRevenue: 154000,
        unpaidRestaurants: 2,
        revenueData: [
          { name: 'Jan', value: 40000 },
          { name: 'Feb', value: 45000 },
          { name: 'Mar', value: 55000 },
          { name: 'Apr', value: 60000 },
          { name: 'May', value: 58000 },
          { name: 'Jun', value: 65000 },
          { name: 'Jul', value: 70000 },
          { name: 'Aug', value: 85000 },
          { name: 'Sep', value: 90000 },
          { name: 'Oct', value: 110000 },
          { name: 'Nov', value: 125000 },
          { name: 'Dec', value: 154000 },
        ],
        paymentStatusData: [
          { name: 'Paid', value: 85, color: '#10B981' },
          { name: 'Pending', value: 10, color: '#F59E0B' },
          { name: 'Overdue', value: 5, color: '#EF4444' },
        ]
      }
    };
  }
};

export const menuAPI = {
  getAll: async () => {
    await mockDelay();
    return { data: [] }; // No static data
  },
  create: async (itemData) => {
    await mockDelay();
    return { data: itemData };
  },
  update: async (id, itemData) => {
    await mockDelay();
    return { data: itemData };
  },
  delete: async () => {
    await mockDelay();
    return { data: { message: 'Deleted' } };
  }
};

export const categoryAPI = {
  getAll: async () => {
    await mockDelay();
    return { data: [] }; // No static data
  },
  create: async (categoryData) => {
    await mockDelay();
    return { data: categoryData };
  },
  update: async (id, categoryData) => {
    await mockDelay();
    return { data: categoryData };
  },
  delete: async () => {
    await mockDelay();
    return { data: { message: 'Deleted' } };
  }
};

export const orderAPI = {
  getOrders: async () => {
    await mockDelay();
    return { data: [] }; // No static data
  },
  create: async (orderData) => {
    await mockDelay();
    return { data: orderData };
  },
  updateStatus: async () => {
    await mockDelay();
    return { data: { message: 'Status updated' } };
  }
};

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
