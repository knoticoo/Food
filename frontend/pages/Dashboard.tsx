import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  Heart,
  Calendar,
  Plus,
  Target
} from 'lucide-react';
import { petsAPI, tasksAPI } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { Pet, Task } from '../types';

const Dashboard: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPets: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });

  const { showNotification } = useNotification();
  
  const today = new Date();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [petsData, tasksData] = await Promise.all([
        petsAPI.getAll(),
        tasksAPI.getAll({ date: today.toISOString().split('T')[0] })
      ]);

      setPets(petsData);
      setTasks(tasksData);

      const completedTasks = tasksData.filter((task: Task) => task.completedAt);
      const pendingTasks = tasksData.filter((task: Task) => !task.completedAt);
      const totalTasks = completedTasks.length + pendingTasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

      setStats({
        totalPets: petsData.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        completionRate
      });
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍽️';
      case 'walk': return '🚶';
      case 'play': return '🎾';
      case 'treat': return '🍖';
      case 'medication': return '💊';
      case 'grooming': return '🛁';
      case 'vet': return '🏥';
      default: return '📝';
    }
  };

  const getTaskTypeName = (type: string) => {
    switch (type) {
      case 'feeding': return 'Feeding';
      case 'walk': return 'Walk';
      case 'play': return 'Play';
      case 'treat': return 'Treat';
      case 'medication': return 'Medication';
      case 'grooming': return 'Grooming';
      case 'vet': return 'Vet';
      default: return 'Other';
    }
  };

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Completed today</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Heart className="text-indigo-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPets}</div>
              <div className="text-sm text-gray-600">Pets</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedTasks}</div>
              <div className="text-sm text-gray-600">Completed today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</div>
              <div className="text-sm text-gray-600">Pending today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Success rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
            <span className="text-sm text-gray-500">
              {stats.pendingTasks} pending
            </span>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600">No tasks scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getTaskIcon(task.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600">
                      {getTaskTypeName(task.type)} • {pets.find(p => p.id === task.petId)?.name || 'Unknown Pet'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(task.scheduledTime), 'HH:mm')}
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-indigo-600">
                    +{tasks.length - 5} more tasks
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Pets */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Pets</h2>
            <span className="text-sm text-gray-500">
              {pets.length} total
            </span>
          </div>
          
          {pets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-gray-600">No pets added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.slice(0, 5).map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getPetIcon(pet.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{pet.name}</div>
                    <div className="text-sm text-gray-600">
                      {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                      {pet.breed && ` • ${pet.breed}`}
                    </div>
                  </div>
                  {pet.age && (
                    <div className="text-sm text-gray-500">
                      {pet.age} years
                    </div>
                  )}
                </div>
              ))}
              {pets.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-indigo-600">
                    +{pets.length - 5} more pets
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Plus className="text-indigo-600" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Add New Pet</div>
              <div className="text-sm text-gray-600">Register a new pet</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Task</div>
              <div className="text-sm text-gray-600">Schedule a new task</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;