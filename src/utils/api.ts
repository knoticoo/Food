import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
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

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// Pets API
export const petsAPI = {
  getAll: async () => {
    const response = await api.get('/pets');
    return response.data;
  },

  create: async (data: {
    name: string;
    type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
    breed?: string;
    age?: number;
    weight?: number;
    avatar?: string;
  }) => {
    const response = await api.post('/pets', data);
    return response.data;
  },

  update: async (id: string, data: {
    name: string;
    type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
    breed?: string;
    age?: number;
    weight?: number;
    avatar?: string;
  }) => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: { petId?: string; date?: string }) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  create: async (data: {
    petId: string;
    title: string;
    description?: string;
    type: 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other';
    scheduledTime: string;
    isRecurring?: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    notes?: string;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: {
    title: string;
    description?: string;
    type: 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other';
    scheduledTime: string;
    isRecurring?: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    notes?: string;
    completedAt?: string;
  }) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  complete: async (id: string, data?: {
    notes?: string;
    duration?: number;
    quantity?: number;
    mood?: 'great' | 'good' | 'okay' | 'bad';
  }) => {
    const response = await api.post(`/tasks/${id}/complete`, data);
    return response.data;
  },
};

// Task Logs API
export const taskLogsAPI = {
  getAll: async (params?: { petId?: string; taskId?: string }) => {
    const response = await api.get('/task-logs', { params });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: {
    name: string;
    email: string;
    avatar?: string;
  }) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};

export default api;