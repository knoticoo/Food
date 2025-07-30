import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Pet, Task, TaskLog } from '../types';
import { loadSampleData } from '../utils/sampleData';

interface PetState {
  pets: Pet[];
  tasks: Task[];
  taskLogs: TaskLog[];
  selectedPetId: string | null;
}

type PetAction =
  | { type: 'ADD_PET'; payload: Pet }
  | { type: 'UPDATE_PET'; payload: Pet }
  | { type: 'DELETE_PET'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: { taskId: string; completedAt: Date } }
  | { type: 'ADD_TASK_LOG'; payload: TaskLog }
  | { type: 'SET_SELECTED_PET'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { pets: Pet[]; tasks: Task[]; taskLogs: TaskLog[] } };

const initialState: PetState = {
  pets: [],
  tasks: [],
  taskLogs: [],
  selectedPetId: null,
};

function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case 'ADD_PET':
      return {
        ...state,
        pets: [...state.pets, action.payload],
      };
    case 'UPDATE_PET':
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === action.payload.id ? action.payload : pet
        ),
      };
    case 'DELETE_PET':
      return {
        ...state,
        pets: state.pets.filter(pet => pet.id !== action.payload),
        tasks: state.tasks.filter(task => task.petId !== action.payload),
        taskLogs: state.taskLogs.filter(log => log.petId !== action.payload),
        selectedPetId: state.selectedPetId === action.payload ? null : state.selectedPetId,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        taskLogs: state.taskLogs.filter(log => log.taskId !== action.payload),
      };
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.taskId 
            ? { ...task, completedAt: action.payload.completedAt }
            : task
        ),
      };
    case 'ADD_TASK_LOG':
      return {
        ...state,
        taskLogs: [...state.taskLogs, action.payload],
      };
    case 'SET_SELECTED_PET':
      return {
        ...state,
        selectedPetId: action.payload,
      };
    case 'LOAD_DATA':
      return {
        ...state,
        pets: action.payload.pets,
        tasks: action.payload.tasks,
        taskLogs: action.payload.taskLogs,
      };
    default:
      return state;
  }
}

interface PetContextType {
  state: PetState;
  dispatch: React.Dispatch<PetAction>;
  getPetById: (id: string) => Pet | undefined;
  getTasksByPetId: (petId: string) => Task[];
  getTaskLogsByPetId: (petId: string) => TaskLog[];
  getTasksByDate: (date: Date) => Task[];
  getCompletedTasksToday: () => Task[];
  getPendingTasksToday: () => Task[];
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(petReducer, initialState);

  // Загружаем примерные данные при первом запуске
  useEffect(() => {
    if (state.pets.length === 0) {
      const sampleData = loadSampleData();
      dispatch({ type: 'LOAD_DATA', payload: sampleData });
    }
  }, [state.pets.length]);

  const getPetById = (id: string) => {
    return state.pets.find(pet => pet.id === id);
  };

  const getTasksByPetId = (petId: string) => {
    return state.tasks.filter(task => task.petId === petId);
  };

  const getTaskLogsByPetId = (petId: string) => {
    return state.taskLogs.filter(log => log.petId === petId);
  };

  const getTasksByDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return state.tasks.filter(task => {
      const taskDate = new Date(task.scheduledTime);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };

  const getCompletedTasksToday = () => {
    const today = new Date();
    return getTasksByDate(today).filter(task => task.completedAt);
  };

  const getPendingTasksToday = () => {
    const today = new Date();
    return getTasksByDate(today).filter(task => !task.completedAt);
  };

  const value: PetContextType = {
    state,
    dispatch,
    getPetById,
    getTasksByPetId,
    getTaskLogsByPetId,
    getTasksByDate,
    getCompletedTasksToday,
    getPendingTasksToday,
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
}

export function usePetContext() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePetContext must be used within a PetProvider');
  }
  return context;
}