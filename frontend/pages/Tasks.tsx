import React, { useState, useEffect } from 'react';
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
  Paperclip,
  MessageCircle,
  Star,
  StarOff,
  Download,
  Eye,
  
  Save
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskAttachment, TaskComment, TaskLog } from '../types';
import { tasksAPI,  taskLogsAPI } from '../utils/api';
import Modal from '../components/ui/Modal';

const Tasks: React.FC = () => {
  const { state, dispatch } = usePetContext();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterPet, setFilterPet] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'comments' | 'logs'>('details');

  // Form state for new/edit task
  const [formData, setFormData] = useState({
    title: '',
    petId: '',
    type: 'feeding' as 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    scheduledTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    isRecurring: false,
    recurrencePattern: 'daily' as 'daily' | 'weekly' | 'monthly',
    notes: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState({ fileUrl: '', fileName: '', fileType: '' });

  useEffect(() => {
    loadTasks();
  }, [selectedDate, filterPet, filterStatus, filterPriority, filterType, searchTerm]);

  const loadTasks = async () => {
    try {
      const params: any = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        petId: filterPet !== 'all' ? filterPet : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        type: filterType !== 'all' ? filterType : undefined
      };
      
      const tasks = await tasksAPI.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load tasks');
    }
  };

  const loadTaskDetails = async (taskId: string) => {
    try {
      const [attachments, comments, logs] = await Promise.all([
        tasksAPI.getAttachments(taskId),
        tasksAPI.getComments(taskId),
        taskLogsAPI.getAll({ taskId })
      ]);
      
      setTaskAttachments(attachments);
      setTaskComments(comments);
      setTaskLogs(logs);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load task details');
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="text-red-500" size={16} />;
      case 'medium': return <Star className="text-yellow-500" size={16} />;
      case 'low': return <StarOff className="text-gray-400" size={16} />;
      default: return null;
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
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesType = filterType === 'all' || task.type === filterType;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isOnDate && matchesPet && matchesStatus && matchesPriority && matchesType && matchesSearch;
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksAPI.complete(taskId);
      
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
    } catch (error) {
      showNotification('error', 'Error', 'Failed to complete task');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.petId) {
      showNotification('error', 'Ошибка', 'Пожалуйста, заполните все обязательные поля.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTask = await tasksAPI.create({
        petId: formData.petId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        scheduledTime: formData.scheduledTime,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        notes: formData.notes,
        priority: formData.priority
      });

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
    } catch (error) {
      showNotification('error', 'Error', 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !formData.title.trim() || !formData.petId) {
      showNotification('error', 'Ошибка', 'Пожалуйста, заполните все обязательные поля.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedTask = await tasksAPI.update(editingTask.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        scheduledTime: formData.scheduledTime,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        notes: formData.notes,
        priority: formData.priority
      });

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
    } catch (error) {
      showNotification('error', 'Error', 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      
      const task = state.tasks.find(t => t.id === taskId);
      const pet = state.pets.find(p => p.id === task?.petId);
      
      showNotification(
        'info',
        'Задача удалена',
        `Задача "${task?.title}" для питомца ${pet?.name} была удалена.`,
        3000
      );
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete task');
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    try {
      const comment = await tasksAPI.createComment(selectedTask.id, { comment: newComment });
      setTaskComments([comment, ...taskComments]);
      setNewComment('');
      setShowCommentForm(false);
      showNotification('success', 'Comment added', 'Comment added successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to add comment');
    }
  };

  const handleUploadAttachment = async () => {
    if (!selectedTask || !newAttachment.fileUrl || !newAttachment.fileName) return;

    try {
      const attachment = await tasksAPI.uploadAttachment(selectedTask.id, newAttachment);
      setTaskAttachments([attachment, ...taskAttachments]);
      setNewAttachment({ fileUrl: '', fileName: '', fileType: '' });
      setShowAttachmentUpload(false);
      showNotification('success', 'Attachment uploaded', 'Attachment uploaded successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to upload attachment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      petId: state.pets[0]?.id || '',
      type: 'feeding',
      priority: 'medium',
      scheduledTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      isRecurring: false,
      recurrencePattern: 'daily',
      notes: '',
      description: ''
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      petId: task.petId,
      type: task.type,
      priority: task.priority,
      scheduledTime: format(new Date(task.scheduledTime), "yyyy-MM-dd'T'HH:mm"),
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern || 'daily',
      notes: task.notes || '',
      description: task.description || ''
    });
    setShowEditModal(true);
  };

  const openTaskDetails = async (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
    setActiveTab('details');
    await loadTaskDetails(task.id);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowTaskDetails(false);
    setEditingTask(null);
    setSelectedTask(null);
    resetForm();
  };

  const tasks = getTasksForDate(selectedDate);
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { locale: ru }),
    end: endOfWeek(selectedDate, { locale: ru })
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Задачи</h1>
          <p className="text-text-secondary mt-1">
            Управляйте задачами по уходу за питомцами
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Добавить задачу
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Фильтры</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            <Filter size={16} />
            {showFilters ? 'Скрыть' : 'Показать'} фильтры
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Питомец</label>
              <select
                className="input"
                value={filterPet}
                onChange={(e) => setFilterPet(e.target.value)}
              >
                <option value="all">Все питомцы</option>
                {state.pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Статус</label>
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает</option>
                <option value="completed">Выполнено</option>
                <option value="overdue">Просрочено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Приоритет</label>
              <select
                className="input"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">Все приоритеты</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Тип задачи</label>
              <select
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Все типы</option>
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
          </div>
        )}

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

      {/* Week Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Неделя</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="btn btn-secondary btn-sm"
            >
              ←
            </button>
            <span className="text-sm font-medium text-text-secondary">
              {format(startOfWeek(selectedDate, { locale: ru }), 'MMM d', { locale: ru })} - {format(endOfWeek(selectedDate, { locale: ru }), 'MMM d', { locale: ru })}
            </span>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="btn btn-secondary btn-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const dayTasks = getTasksForDate(day);
            const hasTasks = dayTasks.length > 0;
            const hasOverdue = dayTasks.some(task => getTaskStatus(task) === 'overdue');
            const hasCompleted = dayTasks.some(task => getTaskStatus(task) === 'completed');

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${
                  isSelected ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-hover'
                }`}
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
                  <div className={`text-xs mt-1 ${
                    isSelected ? 'text-white/80' : 'text-text-secondary'
                  }`}>
                    {dayTasks.length} задач
                  </div>
                  {hasTasks && (
                    <div className="flex justify-center gap-1 mt-1">
                      {hasOverdue && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                      {hasCompleted && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Задачи на {format(selectedDate, 'EEEE, d MMMM', { locale: ru })}
          </h2>
          <span className="text-sm text-text-secondary">{tasks.length} задач</span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Нет задач на этот день</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const pet = state.pets.find(p => p.id === task.petId);
              const status = getTaskStatus(task);
              
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-surface-hover rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary">{task.title}</h3>
                        {getPriorityIcon(task.priority)}
                        {status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                        {status === 'overdue' && <AlertCircle size={16} className="text-red-500" />}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {getTaskTypeName(task.type)} • {pet?.name}
                      </div>
                      {task.description && (
                        <p className="text-sm text-text-muted mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-text-primary">
                        {format(new Date(task.scheduledTime), 'HH:mm')}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {format(new Date(task.scheduledTime), 'MMM d', { locale: ru })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.attachments && task.attachments.length > 0 && (
                        <Paperclip size={16} className="text-text-muted" />
                      )}
                      {task.comments && task.comments.length > 0 && (
                        <MessageCircle size={16} className="text-text-muted" />
                      )}
                      
                      <button
                        onClick={() => openTaskDetails(task)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => openEditModal(task)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={closeModal}
        title={editingTask ? 'Редактировать задачу' : 'Добавить задачу'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); editingTask ? handleEditTask(e) : handleAddTask(e); }}>
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
                Описание
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Дополнительное описание задачи..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'feeding' | 'walk' | 'play' | 'treat' | 'medication' | 'grooming' | 'vet' | 'other' })}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Приоритет
                </label>
                <select 
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
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

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Периодичность
                </label>
                <select 
                  className="input"
                  value={formData.recurrencePattern}
                  onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                >
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Заметки
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Дополнительные заметки..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              className="btn btn-secondary flex-1"
              onClick={closeModal}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading"></div>
              ) : (
                <>
                  <Save size={20} />
                  {editingTask ? 'Обновить' : 'Добавить'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={showTaskDetails}
          onClose={() => setShowTaskDetails(false)}
          title={`${selectedTask.title} - Детали`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'details', label: 'Детали', icon: Eye },
                { id: 'attachments', label: 'Вложения', icon: Paperclip },
                { id: 'comments', label: 'Комментарии', icon: MessageCircle },
                { id: 'logs', label: 'История', icon: Clock }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Основная информация</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Название:</span> {selectedTask.title}</p>
                        <p><span className="font-medium">Тип:</span> {getTaskTypeName(selectedTask.type)}</p>
                        <p><span className="font-medium">Приоритет:</span> {selectedTask.priority}</p>
                        <p><span className="font-medium">Время:</span> {format(new Date(selectedTask.scheduledTime), 'dd.MM.yyyy HH:mm')}</p>
                        {selectedTask.description && <p><span className="font-medium">Описание:</span> {selectedTask.description}</p>}
                        {selectedTask.notes && <p><span className="font-medium">Заметки:</span> {selectedTask.notes}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Статус</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Статус:</span> {getTaskStatus(selectedTask)}</p>
                        {selectedTask.completedAt && <p><span className="font-medium">Выполнено:</span> {format(new Date(selectedTask.completedAt), 'dd.MM.yyyy HH:mm')}</p>}
                        {selectedTask.isRecurring && <p><span className="font-medium">Повторение:</span> {selectedTask.recurrencePattern}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Вложения</h3>
                    <button
                      onClick={() => setShowAttachmentUpload(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Paperclip size={16} />
                      Добавить вложение
                    </button>
                  </div>
                  
                  {taskAttachments.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Paperclip size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Нет вложений</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taskAttachments.map((attachment) => (
                        <div key={attachment.id} className="card">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Paperclip size={20} className="text-primary" />
                              <div>
                                <p className="font-semibold">{attachment.fileName}</p>
                                <p className="text-text-secondary text-sm">{attachment.fileType}</p>
                                <p className="text-text-muted text-xs">{format(new Date(attachment.uploadedAt), 'dd.MM.yyyy HH:mm')}</p>
                              </div>
                            </div>
                            <button className="btn btn-secondary btn-sm">
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Комментарии</h3>
                    <button
                      onClick={() => setShowCommentForm(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <MessageCircle size={16} />
                      Добавить комментарий
                    </button>
                  </div>
                  
                  {taskComments.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Нет комментариев</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taskComments.map((comment) => (
                        <div key={comment.id} className="card">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{comment.userName}</p>
                              <p className="text-text-secondary mt-1">{comment.comment}</p>
                              <p className="text-text-muted text-xs mt-2">{format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">История выполнения</h3>
                  
                  {taskLogs.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Clock size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Нет записей</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taskLogs.map((log) => (
                        <div key={log.id} className="card">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Выполнено {format(new Date(log.completedAt), 'dd.MM.yyyy HH:mm')}</p>
                              {log.notes && <p className="text-text-secondary text-sm mt-1">{log.notes}</p>}
                              <div className="flex gap-4 mt-2 text-xs text-text-muted">
                                {log.duration && <span>Длительность: {log.duration} мин</span>}
                                {log.quantity && <span>Количество: {log.quantity}</span>}
                                {log.mood && <span>Настроение: {log.mood}</span>}
                              </div>
                            </div>
                            <CheckCircle size={20} className="text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Comment Form Modal */}
      <Modal
        isOpen={showCommentForm}
        onClose={() => setShowCommentForm(false)}
        title="Добавить комментарий"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Комментарий</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Введите ваш комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setShowCommentForm(false)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Добавить
            </button>
          </div>
        </div>
      </Modal>

      {/* Attachment Upload Modal */}
      <Modal
        isOpen={showAttachmentUpload}
        onClose={() => setShowAttachmentUpload(false)}
        title="Добавить вложение"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL файла *</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com/file.pdf"
              value={newAttachment.fileUrl}
              onChange={(e) => setNewAttachment({ ...newAttachment, fileUrl: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Название файла *</label>
            <input
              type="text"
              className="input"
              placeholder="document.pdf"
              value={newAttachment.fileName}
              onChange={(e) => setNewAttachment({ ...newAttachment, fileName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Тип файла</label>
            <input
              type="text"
              className="input"
              placeholder="application/pdf"
              value={newAttachment.fileType}
              onChange={(e) => setNewAttachment({ ...newAttachment, fileType: e.target.value })}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setShowAttachmentUpload(false)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={handleUploadAttachment}
              disabled={!newAttachment.fileUrl || !newAttachment.fileName}
            >
              Загрузить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;