export interface Pet {
  id: string;
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
  createdAt: Date;
}

export interface PetPhoto {
  id: string;
  petId: string;
  photoUrl: string;
  caption?: string;
  uploadedAt: Date;
}

export interface PetMilestone {
  id: string;
  petId: string;
  title: string;
  description?: string;
  milestoneDate: string;
  type: string;
  createdAt: Date;
}

export interface PetWeightLog {
  id: string;
  petId: string;
  weight: number;
  measuredAt: Date;
  notes?: string;
}

export interface PetMoodLog {
  id: string;
  petId: string;
  mood: string;
  notes?: string;
  loggedAt: Date;
}

export interface Task {
  id: string;
  petId: string;
  title: string;
  description?: string;
  type: 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other';
  priority: 'low' | 'medium' | 'high';
  scheduledTime: Date;
  completedAt?: Date;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  createdAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
}

export interface TaskLog {
  id: string;
  taskId: string;
  petId: string;
  completedAt: Date;
  notes?: string;
  duration?: number; // в минутах
  quantity?: number; // для кормления, лакомств
  mood?: 'great' | 'good' | 'okay' | 'bad';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'reminder' | 'achievement' | 'birthday';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface PetAchievement {
  id: string;
  petId: string;
  type: string;
  title: string;
  description?: string;
  icon?: string;
  earnedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: {
    email?: boolean;
    push?: boolean;
    reminders?: boolean;
  };
  dashboard?: {
    widgets?: string[];
    layout?: string;
  };
}

export interface SharedAccess {
  id: string;
  petId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'caregiver' | 'viewer';
  createdAt: Date;
}

export interface PetCareTip {
  id: string;
  type: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TaskAnalytics {
  type: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface PetAnalytics {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'reminder' | 'achievement' | 'birthday';
export type PetMood = 'happy' | 'excited' | 'calm' | 'anxious' | 'sick' | 'playful' | 'tired';