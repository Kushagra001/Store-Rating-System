import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'store_owner';
  address?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner: User;
  averageRating?: number;
}

export interface Rating {
  id: string;
  store: string;
  user: string;
  rating: number;
}

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (userData: Omit<User, 'id'> & { password: string }) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  }
};

export const storeService = {
  getStores: async (search?: string, sort?: string, order?: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);
    
    const { data } = await api.get<Store[]>(`/stores?${params.toString()}`);
    return data;
  },

  createStore: async (storeData: Omit<Store, 'id' | 'owner'> & { owner_id: string }) => {
    const { data } = await api.post<Store>('/stores', storeData);
    return data;
  }
};

export const ratingService = {
  submitRating: async (storeId: string, rating: number) => {
    const { data } = await api.post<Rating>('/ratings', { store_id: storeId, rating });
    return data;
  }
};

export const adminService = {
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  }
};

export default api; 