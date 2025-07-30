import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Heart,
  Calendar,
  Activity,
  Plus,
  AlertCircle
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { useNotification } from '../context/NotificationContext';

const Dashboard: React.FC = () => {
  const { state, getCompletedTasksToday, getPendingTasksToday } = usePetContext();
  const { showNotification } = useNotification();
  
  const today = new Date();
  const completedTasks = getCompletedTasksToday();
  const pendingTasks = getPendingTasksToday();
  const totalTasks = completedTasks.length + pendingTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

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
      case 'feeding': return 'Кормление';
      case 'walk': return 'Прогулка';
      case 'play': return 'Игра';
      case 'treat': return 'Лакомство';
      case 'medication': return 'Лекарство';
      case 'grooming': return 'Уход';
      case 'vet': return 'Ветеринар';
      default: return 'Другое';
    }
  };

  const handleQuickAdd = (type: 'pet' | 'task') => {
    if (type === 'pet') {
      showNotification('info', 'Добавление питомца', 'Переходим на страницу питомцев для добавления нового питомца.');
    } else {
      showNotification('info', 'Новая задача', 'Переходим на страницу задач для создания новой задачи.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Добро пожаловать!</h1>
          <p className="text-text-secondary mt-1">
            {format(today, 'EEEE, d MMMM yyyy', { locale: ru })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{completionRate}%</div>
          <div className="text-sm text-text-secondary">Выполнено сегодня</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.pets.length}</div>
              <div className="text-sm text-text-secondary">Питомцев</div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="text-success" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <div className="text-sm text-text-secondary">Выполнено сегодня</div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <div className="text-sm text-text-secondary">Ожидают</div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Activity className="text-info" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.tasks.length}</div>
              <div className="text-sm text-text-secondary">Всего задач</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="flex items-center gap-3 p-4 bg-surface-hover rounded-lg hover:bg-surface transition-all duration-200"
            onClick={() => handleQuickAdd('pet')}
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="text-primary" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium">Добавить питомца</div>
              <div className="text-sm text-text-secondary">Создать профиль нового питомца</div>
            </div>
          </button>

          <button 
            className="flex items-center gap-3 p-4 bg-surface-hover rounded-lg hover:bg-surface transition-all duration-200"
            onClick={() => handleQuickAdd('task')}
          >
            <div className="p-2 bg-success/10 rounded-lg">
              <Calendar className="text-success" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium">Новая задача</div>
              <div className="text-sm text-text-secondary">Создать задачу для питомца</div>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ожидающие задачи</h2>
            <span className="badge badge-warning">{pendingTasks.length}</span>
          </div>
          
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Clock size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет ожидающих задач</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => {
                const pet = state.pets.find(p => p.id === task.petId);
                const isOverdue = new Date(task.scheduledTime) < new Date();
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTaskIcon(task.type)}</span>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-text-secondary">
                          {pet?.name} • {getTaskTypeName(task.type)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {format(new Date(task.scheduledTime), 'HH:mm')}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-danger flex items-center gap-1">
                          <AlertCircle size={12} />
                          Просрочено
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Выполненные задачи</h2>
            <span className="badge badge-success">{completedTasks.length}</span>
          </div>
          
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет выполненных задач</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.slice(0, 5).map((task) => {
                const pet = state.pets.find(p => p.id === task.petId);
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTaskIcon(task.type)}</span>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-text-secondary">
                          {pet?.name} • {getTaskTypeName(task.type)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {task.completedAt && format(new Date(task.completedAt), 'HH:mm')}
                      </div>
                      <div className="text-xs text-success flex items-center gap-1">
                        <CheckCircle size={12} />
                        Выполнено
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Недавняя активность</h2>
        <div className="space-y-3">
          {state.taskLogs.slice(0, 10).map((log) => {
            const task = state.tasks.find(t => t.id === log.taskId);
            const pet = state.pets.find(p => p.id === log.petId);
            
            return (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{task?.title}</span> для{' '}
                    <span className="font-medium">{pet?.name}</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {format(new Date(log.completedAt), 'dd.MM.yyyy HH:mm')}
                  </div>
                </div>
              </div>
            );
          })}
          
          {state.taskLogs.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              <Activity size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет активности</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;