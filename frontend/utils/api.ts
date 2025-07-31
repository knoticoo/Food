import axios from 'axios';
import { 
  Pet, PetPhoto, PetMilestone, PetWeightLog, PetMoodLog, 
  Task, TaskAttachment, TaskComment, TaskLog,
  Notification, PetAchievement, SharedAccess, PetCareTip,
  TaskAnalytics, PetAnalytics, UserPreferences
} from '../types';

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
    console.log('API: Registering user with data:', { ...data, password: '***' });
    const response = await api.post('/auth/register', data);
    console.log('API: Register response:', response.data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    console.log('API: Logging in user with data:', { ...data, password: '***' });
    const response = await api.post('/auth/login', data);
    console.log('API: Login response:', response.data);
    return response.data;
  },
};

// Pets API
export const petsAPI = {
  getAll: async (): Promise<Pet[]> => {
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
    favoriteToys?: string;
    allergies?: string;
    specialNeeds?: string;
    adoptionDate?: string;
  }): Promise<Pet> => {
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
    favoriteToys?: string;
    allergies?: string;
    specialNeeds?: string;
    adoptionDate?: string;
  }): Promise<Pet> => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  },

  // Pet photos
  getPhotos: async (petId: string): Promise<PetPhoto[]> => {
    const response = await api.get(`/pets/${petId}/photos`);
    return response.data;
  },

  uploadPhoto: async (petId: string, data: { photoUrl: string; caption?: string }): Promise<PetPhoto> => {
    const response = await api.post(`/pets/${petId}/photos`, data);
    return response.data;
  },

  // Pet milestones
  getMilestones: async (petId: string): Promise<PetMilestone[]> => {
    const response = await api.get(`/pets/${petId}/milestones`);
    return response.data;
  },

  createMilestone: async (petId: string, data: {
    title: string;
    description?: string;
    milestoneDate: string;
    type: string;
  }): Promise<PetMilestone> => {
    const response = await api.post(`/pets/${petId}/milestones`, data);
    return response.data;
  },

  // Pet weight tracking
  getWeightLogs: async (petId: string): Promise<PetWeightLog[]> => {
    const response = await api.get(`/pets/${petId}/weight`);
    return response.data;
  },

  logWeight: async (petId: string, data: { weight: number; notes?: string }): Promise<PetWeightLog> => {
    const response = await api.post(`/pets/${petId}/weight`, data);
    return response.data;
  },

  // Pet mood tracking
  getMoodLogs: async (petId: string): Promise<PetMoodLog[]> => {
    const response = await api.get(`/pets/${petId}/mood`);
    return response.data;
  },

  logMood: async (petId: string, data: { mood: string; notes?: string }): Promise<PetMoodLog> => {
    const response = await api.post(`/pets/${petId}/mood`, data);
    return response.data;
  },

  // Pet achievements
  getAchievements: async (petId: string): Promise<PetAchievement[]> => {
    const response = await api.get(`/pets/${petId}/achievements`);
    return response.data;
  },

  createAchievement: async (petId: string, data: {
    type: string;
    title: string;
    description?: string;
    icon?: string;
  }): Promise<PetAchievement> => {
    const response = await api.post(`/pets/${petId}/achievements`, data);
    return response.data;
  },

  // Shared access
  getSharedAccess: async (petId: string): Promise<SharedAccess[]> => {
    const response = await api.get(`/pets/${petId}/shared`);
    return response.data;
  },

  shareAccess: async (petId: string, data: { email: string; role: 'owner' | 'caregiver' | 'viewer' }): Promise<SharedAccess> => {
    const response = await api.post(`/pets/${petId}/shared`, data);
    return response.data;
  },

  removeSharedAccess: async (petId: string, userId: string): Promise<void> => {
    const response = await api.delete(`/pets/${petId}/shared/${userId}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: { petId?: string; date?: string; priority?: string; type?: string }): Promise<Task[]> => {
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
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> => {
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
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  complete: async (id: string, data?: {
    notes?: string;
    duration?: number;
    quantity?: number;
    mood?: 'great' | 'good' | 'okay' | 'bad';
  }): Promise<void> => {
    const response = await api.post(`/tasks/${id}/complete`, data);
    return response.data;
  },

  // Task attachments
  getAttachments: async (taskId: string): Promise<TaskAttachment[]> => {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  uploadAttachment: async (taskId: string, data: {
    fileUrl: string;
    fileName: string;
    fileType?: string;
  }): Promise<TaskAttachment> => {
    const response = await api.post(`/tasks/${taskId}/attachments`, data);
    return response.data;
  },

  // Task comments
  getComments: async (taskId: string): Promise<TaskComment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  createComment: async (taskId: string, data: { comment: string }): Promise<TaskComment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params?: { isRead?: boolean }): Promise<Notification[]> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  create: async (data: {
    type: 'success' | 'error' | 'warning' | 'info' | 'reminder' | 'achievement' | 'birthday';
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<Notification> => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getTaskAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    petId?: string;
  }): Promise<TaskAnalytics[]> => {
    const response = await api.get('/analytics/tasks', { params });
    return response.data;
  },

  getPetAnalytics: async (params?: { petId?: string }): Promise<PetAnalytics[]> => {
    const response = await api.get('/analytics/pets', { params });
    return response.data;
  },
};

// Pet care tips API
export const petCareTipsAPI = {
  getAll: async (params?: { type?: string; category?: string }): Promise<PetCareTip[]> => {
    const response = await api.get('/pet-care-tips', { params });
    return response.data;
  },
};

// User preferences API
export const userPreferencesAPI = {
  get: async (): Promise<UserPreferences> => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  update: async (preferences: UserPreferences): Promise<UserPreferences> => {
    const response = await api.put('/user/preferences', { preferences });
    return response.data;
  },
};

export default api;