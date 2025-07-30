import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  PawPrint,
  Calendar,
  Activity
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import logger from '../utils/logger';

const Dashboard: React.FC = () => {
  logger.log('📊 Dashboard component rendering...');
  const { state, getCompletedTasksToday, getPendingTasksToday } = usePetContext();
  
  console.log('📈 Dashboard state:', {
    petsCount: state.pets.length,
    tasksCount: state.tasks.length,
    taskLogsCount: state.taskLogs.length
  });
  
  const today = new Date();
  const completedTasks = getCompletedTasksToday();
  const pendingTasks = getPendingTasksToday();
  const totalTasks = completedTasks.length + pendingTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  console.log('📅 Today\'s tasks:', {
    completed: completedTasks.length,
    pending: pendingTasks.length,
    total: totalTasks,
    completionRate: completionRate
  });

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

  console.log('🎨 Rendering Dashboard JSX...');

  return (
    <div className="space-y-6">
      {/* Debug indicator */}
      <div style={{ 
        position: 'fixed', 
        bottom: '0', 
        left: '0', 
        background: 'green', 
        color: 'white', 
        padding: '5px', 
        zIndex: 9997,
        fontSize: '12px'
      }}>
        Dashboard rendering - {completedTasks.length} completed, {pendingTasks.length} pending
      </div>
      
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
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <div className="text-sm text-text-secondary">Ожидают</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="text-success" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <div className="text-sm text-text-secondary">Выполнено</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <PawPrint className="text-warning" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.pets.length}</div>
              <div className="text-sm text-text-secondary">Питомцев</div>
            </div>
          </div>
        </div>

        <div className="card">
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

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={20} />
              Задачи на сегодня
            </h2>
            <span className="badge badge-warning">{pendingTasks.length}</span>
          </div>
          
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет задач на сегодня</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => {
                const pet = state.pets.find(p => p.id === task.petId);
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
                      <button className="btn btn-success btn-sm mt-1">
                        Выполнить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} />
              Недавняя активность
            </h2>
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
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="text-success" size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-text-secondary">
                        {pet?.name} • {format(new Date(task.completedAt!), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn btn-primary">
            <PawPrint size={16} />
            Добавить питомца
          </button>
          <button className="btn btn-secondary">
            <Calendar size={16} />
            Новая задача
          </button>
          <button className="btn btn-secondary">
            <Activity size={16} />
            Записать активность
          </button>
          <button className="btn btn-secondary">
            <TrendingUp size={16} />
            Статистика
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;