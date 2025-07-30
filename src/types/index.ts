export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  avatar?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  petId: string;
  title: string;
  description?: string;
  type: 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other';
  scheduledTime: Date;
  completedAt?: Date;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SharedAccess {
  id: string;
  petId: string;
  userId: string;
  role: 'owner' | 'caregiver' | 'viewer';
  createdAt: Date;
}

export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';