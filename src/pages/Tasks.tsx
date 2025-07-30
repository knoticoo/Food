import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { useNotification } from '../context/NotificationContext';
import { Task } from '../types';
import Modal from '../components/Modal';

const Tasks: React.FC = () => {
  const { state, dispatch } = usePetContext();
  const { showNotification } = useNotification();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPet, setFilterPet] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for new/edit task
  const [formData, setFormData] = useState({
    title: '',
    petId: '',
    type: 'feeding',
    scheduledTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    isRecurring: false,
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

  const getTaskStatus = (task: Task) => {
    if (task.completedAt) return 'completed';
    const now = new Date();
    const taskTime = new Date(task.scheduledTime);
    return taskTime < now ? 'overdue' : 'pending';
  };

  const getTasksForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return state.tasks.filter(task => {
      const taskDate = new Date(task.scheduledTime);
      const isOnDate = taskDate >= startOfDay && taskDate <= endOfDay;
      const matchesPet = filterPet === 'all' || task.petId === filterPet;
      const matchesStatus = filterStatus === 'all' || getTaskStatus(task) === filterStatus;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isOnDate && matchesPet && matchesStatus && matchesSearch;
    });
  };

  const handleCompleteTask = (taskId: string) => {
    dispatch({ 
      type: 'COMPLETE_TASK', 
      payload: { taskId, completedAt: new Date() } 
    });
    
    const task = state.tasks.find(t => t.id === taskId);
    const pet = state.pets.find(p => p.id === task?.petId);
    
    showNotification(
      'success',
      'Задача выполнена!',
      `Задача "${task?.title}" для питомца ${pet?.name} отмечена как выполненная.`,
      3000
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.petId) {
      showNotification('error', 'Ошибка', 'Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      petId: formData.petId,
      title: formData.title,
      type: formData.type,
      scheduledTime: new Date(formData.scheduledTime),
      isRecurring: formData.isRecurring,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    setShowAddModal(false);
    resetForm();
    
    const pet = state.pets.find(p => p.id === formData.petId);
    showNotification(
      'success',
      'Задача добавлена!',
      `Новая задача "${formData.title}" для питомца ${pet?.name} успешно создана.`,
      3000
    );
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !formData.title.trim() || !formData.petId) {
      showNotification('error', 'Ошибка', 'Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      petId: formData.petId,
      title: formData.title,
      type: formData.type,
      scheduledTime: new Date(formData.scheduledTime),
      isRecurring: formData.isRecurring,
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    setShowEditModal(false);
    setEditingTask(null);
    resetForm();
    
    const pet = state.pets.find(p => p.id === formData.petId);
    showNotification(
      'success',
      'Задача обновлена!',
      `Задача "${formData.title}" для питомца ${pet?.name} успешно обновлена.`,
      3000
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    const pet = state.pets.find(p => p.id === task?.petId);
    
    dispatch({ type: 'DELETE_TASK', payload: taskId });
    
    showNotification(
      'info',
      'Задача удалена',
      `Задача "${task?.title}" для питомца ${pet?.name} была удалена.`,
      3000
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      petId: state.pets[0]?.id || '',
      type: 'feeding',
      scheduledTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      isRecurring: false,
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      petId: task.petId,
      type: task.type,
      scheduledTime: format(new Date(task.scheduledTime), "yyyy-MM-dd'T'HH:mm"),
      isRecurring: task.isRecurring,
    });
    setShowEditModal(true);
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { locale: ru }),
    end: endOfWeek(selectedDate, { locale: ru }),
  });

  const todayTasks = getTasksForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Задачи</h1>
          <p className="text-text-secondary mt-1">
            Управляйте расписанием ухода за питомцами
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Plus size={16} />
          Новая задача
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Фильтры:</span>
          </div>
          
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

          <select 
            className="input w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидают</option>
            <option value="completed">Выполнено</option>
            <option value="overdue">Просрочено</option>
          </select>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Search size={16} className="text-text-muted" />
            <input
              type="text"
              placeholder="Поиск задач..."
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Calendar Week View */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Неделя</h2>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              ←
            </button>
            <span className="text-sm font-medium">
              {format(weekDays[0], 'd MMM', { locale: ru })} - {format(weekDays[6], 'd MMM yyyy', { locale: ru })}
            </span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            
            return (
              <div 
                key={day.toISOString()}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary text-white shadow-md' 
                    : isToday 
                      ? 'bg-primary/10 border border-primary hover:bg-primary/20' 
                      : 'bg-surface-hover hover:bg-surface'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-text-secondary'
                  }`}>
                    {format(day, 'EEE', { locale: ru })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isSelected ? 'text-white' : 'text-text-primary'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className={`text-xs mt-1 ${
                      isSelected ? 'text-white/80' : 'text-text-secondary'
                    }`}>
                      {dayTasks.length} задач
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Задачи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </h2>
          <span className="badge badge-primary">{todayTasks.length}</span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Нет задач на этот день</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => {
              const pet = state.pets.find(p => p.id === task.petId);
              const status = getTaskStatus(task);
              
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-surface-hover rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-text-secondary">
                        {pet?.name} • {getTaskTypeName(task.type)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {format(new Date(task.scheduledTime), 'HH:mm')}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {task.isRecurring ? 'Повторяется' : 'Однократно'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status === 'completed' ? (
                        <div className="badge badge-success">
                          <CheckCircle size={12} />
                          Выполнено
                        </div>
                      ) : status === 'overdue' ? (
                        <div className="badge badge-danger">
                          <AlertCircle size={12} />
                          Просрочено
                        </div>
                      ) : (
                        <div className="badge badge-warning">
                          <Clock size={12} />
                          Ожидает
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {status !== 'completed' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            Выполнить
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(task)}
                        >
                          <Edit size={12} />
                        </button>
                        
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Новая задача"
        size="lg"
      >
        <form onSubmit={handleAddTask}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название задачи *
              </label>
              <input 
                type="text" 
                className="input"
                placeholder="Например: Утреннее кормление"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Питомец *
              </label>
              <select 
                className="input"
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                required
              >
                <option value="">Выберите питомца</option>
                {state.pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Тип задачи
              </label>
              <select 
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="feeding">Кормление</option>
                <option value="walk">Прогулка</option>
                <option value="play">Игра</option>
                <option value="treat">Лакомство</option>
                <option value="medication">Лекарство</option>
                <option value="grooming">Уход</option>
                <option value="vet">Ветеринар</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Время *
              </label>
              <input 
                type="datetime-local" 
                className="input"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="recurring"
                className="rounded"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              <label htmlFor="recurring" className="text-sm">
                Повторяющаяся задача
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="btn btn-primary flex-1"
            >
              Добавить
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        title="Редактировать задачу"
        size="lg"
      >
        <form onSubmit={handleEditTask}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название задачи *
              </label>
              <input 
                type="text" 
                className="input"
                placeholder="Например: Утреннее кормление"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Питомец *
              </label>
              <select 
                className="input"
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                required
              >
                <option value="">Выберите питомца</option>
                {state.pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Тип задачи
              </label>
              <select 
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="feeding">Кормление</option>
                <option value="walk">Прогулка</option>
                <option value="play">Игра</option>
                <option value="treat">Лакомство</option>
                <option value="medication">Лекарство</option>
                <option value="grooming">Уход</option>
                <option value="vet">Ветеринар</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Время *
              </label>
              <input 
                type="datetime-local" 
                className="input"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="edit-recurring"
                className="rounded"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              <label htmlFor="edit-recurring" className="text-sm">
                Повторяющаяся задача
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => {
                setShowEditModal(false);
                setEditingTask(null);
              }}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="btn btn-primary flex-1"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;