import React, { useState } from 'react';
import { format, subDays, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Filter,
  Download,
  BarChart3
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';

const History: React.FC = () => {
  const { state } = usePetContext();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filterPet, setFilterPet] = useState<string>('all');

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

  const getCompletedTasks = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = startOfWeek(now, { locale: ru });
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = subDays(now, 7);
    }

    return state.tasks
      .filter(task => task.completedAt && new Date(task.completedAt) >= startDate)
      .filter(task => filterPet === 'all' || task.petId === filterPet)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  };

  const getStats = () => {
    const completedTasks = getCompletedTasks();
    const totalTasks = completedTasks.length;
    
    const stats = {
      total: totalTasks,
      byType: {} as Record<string, number>,
      byPet: {} as Record<string, number>,
      averagePerDay: 0,
    };

    completedTasks.forEach(task => {
      // Count by type
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
      
      // Count by pet
      stats.byPet[task.petId] = (stats.byPet[task.petId] || 0) + 1;
    });

    // Calculate average per day
    const daysDiff = Math.ceil((new Date().getTime() - subDays(new Date(), 7).getTime()) / (1000 * 60 * 60 * 24));
    stats.averagePerDay = daysDiff > 0 ? Math.round(totalTasks / daysDiff * 10) / 10 : 0;

    return stats;
  };

  const completedTasks = getCompletedTasks();
  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">История активности</h1>
          <p className="text-text-secondary mt-1">
            Просматривайте выполненные задачи и статистику
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} />
          Экспорт
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Фильтры:</span>
          </div>
          
          <select 
            className="input w-auto"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="custom">7 дней</option>
          </select>

          <select 
            className="input w-auto"
            value={filterPet}
            onChange={(e) => setFilterPet(e.target.value)}
          >
            <option value="all">Все питомцы</option>
            {state.pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-text-secondary">Всего выполнено</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Calendar className="text-success" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.averagePerDay}</div>
              <div className="text-sm text-text-secondary">В день</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <BarChart3 className="text-warning" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
              <div className="text-sm text-text-secondary">Типов задач</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Clock className="text-info" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.pets.length}</div>
              <div className="text-sm text-text-secondary">Питомцев</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Активность по типам</h2>
          <div className="space-y-3">
            {Object.entries(stats.byType)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTaskIcon(type)}</span>
                    <div>
                      <div className="font-medium">{getTaskTypeName(type)}</div>
                      <div className="text-sm text-text-secondary">
                        {Math.round((count / stats.total) * 100)}% от общего
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Активность по питомцам</h2>
          <div className="space-y-3">
            {Object.entries(stats.byPet)
              .sort(([,a], [,b]) => b - a)
              .map(([petId, count]) => {
                const pet = state.pets.find(p => p.id === petId);
                return (
                  <div key={petId} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{pet?.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{pet?.name}</div>
                        <div className="text-sm text-text-secondary">
                          {Math.round((count / stats.total) * 100)}% от общего
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold">{count}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Недавняя активность</h2>
          <span className="badge badge-primary">{completedTasks.length}</span>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Нет выполненных задач за выбранный период</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTasks.slice(0, 20).map((task) => {
              const pet = state.pets.find(p => p.id === task.petId);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-text-secondary">
                        {pet?.name} • {getTaskTypeName(task.type)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {format(new Date(task.completedAt!), 'dd.MM.yyyy')}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {format(new Date(task.completedAt!), 'HH:mm')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;