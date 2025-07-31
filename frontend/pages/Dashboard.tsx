import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Clock, 
  CheckCircle, 
  Heart,
  Calendar,
  Plus,
  Target,
  TrendingUp,
  Bell,
  Award,
  BookOpen,
  Users,
  Activity,
  Zap,
  Star,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Task, Notification, PetCareTip, PetAchievement, TaskAnalytics, PetAnalytics } from '../types';
import { tasksAPI, notificationsAPI, petCareTipsAPI, analyticsAPI } from '../utils/api';
import Modal from '../components/ui/Modal';

const Dashboard: React.FC = () => {
  const { state, dispatch } = usePetContext();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [petCareTips, setPetCareTips] = useState<PetCareTip[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<PetAchievement[]>([]);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics[]>([]);
  const [petAnalytics, setPetAnalytics] = useState<PetAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedTip, setSelectedTip] = useState<PetCareTip | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        notificationsData,
        tipsData,
        taskStats,
        petStats
      ] = await Promise.all([
        notificationsAPI.getAll({ isRead: false }),
        petCareTipsAPI.getAll({ limit: 5 }),
        analyticsAPI.getTaskAnalytics(),
        analyticsAPI.getPetAnalytics()
      ]);

      setNotifications(notificationsData);
      setPetCareTips(tipsData);
      setTaskAnalytics(taskStats);
      setPetAnalytics(petStats);
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
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };

  const getTasksForWeek = () => {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(currentWeek, { locale: ru }),
      end: endOfWeek(currentWeek, { locale: ru })
    });

    return weekDays.map(day => ({
      date: day,
      tasks: getTasksForDate(day)
    }));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="text-red-500" size={14} />;
      case 'medium': return <Star className="text-yellow-500" size={14} />;
      case 'low': return <Star className="text-gray-400" size={14} />;
      default: return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={16} />;
      case 'error': return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info': return <Info className="text-blue-500" size={16} />;
      case 'reminder': return <Clock className="text-orange-500" size={16} />;
      case 'achievement': return <Award className="text-purple-500" size={16} />;
      case 'birthday': return <Heart className="text-pink-500" size={16} />;
      default: return <Bell className="text-gray-500" size={16} />;
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      showNotification('success', 'Notification marked as read');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications([]);
      showNotification('success', 'All notifications marked as read');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to mark all notifications as read');
    }
  };

  const weekData = getTasksForWeek();
  const todayTasks = getTasksForDate(new Date());
  const upcomingTasks = state.tasks
    .filter(task => !task.completedAt && new Date(task.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);

  const completedTasks = state.tasks.filter(task => task.completedAt);
  const pendingTasks = state.tasks.filter(task => !task.completedAt);
  const overdueTasks = state.tasks.filter(task => getTaskStatus(task) === 'overdue');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Панель управления</h1>
          <p className="text-text-secondary mt-1">
            Обзор ухода за вашими питомцами
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
            onClick={() => setShowNotifications(true)}
            className="btn btn-secondary relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Всего питомцев</p>
              <p className="text-2xl font-bold text-text-primary">{state.pets.length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Heart className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Задач сегодня</p>
              <p className="text-2xl font-bold text-text-primary">{todayTasks.length}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-full">
              <Calendar className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Выполнено</p>
              <p className="text-2xl font-bold text-text-primary">{completedTasks.length}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Просрочено</p>
              <p className="text-2xl font-bold text-text-primary">{overdueTasks.length}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Задачи на сегодня</h2>
              <span className="text-sm text-text-secondary">{todayTasks.length} задач</span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет задач на сегодня</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => {
                  const pet = state.pets.find(p => p.id === task.petId);
                  const status = getTaskStatus(task);
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTaskIcon(task.type)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-text-primary">{task.title}</h3>
                            {getPriorityIcon(task.priority)}
                            {status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                            {status === 'overdue' && <AlertTriangle size={14} className="text-red-500" />}
                          </div>
                          <p className="text-sm text-text-secondary">
                            {getTaskTypeName(task.type)} • {pet?.name} • {format(new Date(task.scheduledTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {status !== 'completed' && (
                          <button
                            onClick={() => {
                              // Handle complete task
                              showNotification('success', 'Task completed', 'Task marked as completed');
                            }}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Недельный обзор</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-text-secondary">
                  {format(startOfWeek(currentWeek, { locale: ru }), 'MMM d', { locale: ru })} - {format(endOfWeek(currentWeek, { locale: ru }), 'MMM d', { locale: ru })}
                </span>
                <button
                  onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekData.map(({ date, tasks }) => {
                const isToday = isToday(date);
                const isYesterday = isYesterday(date);
                const isTomorrow = isTomorrow(date);
                const hasTasks = tasks.length > 0;
                const hasOverdue = tasks.some(task => getTaskStatus(task) === 'overdue');
                const hasCompleted = tasks.some(task => getTaskStatus(task) === 'completed');

                return (
                  <div
                    key={date.toString()}
                    className={`p-3 rounded-lg text-center transition-all duration-200 ${
                      isToday ? 'bg-primary text-white shadow-md' : 'bg-surface-hover'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-xs font-medium ${
                        isToday ? 'text-white' : 'text-text-secondary'
                      }`}>
                        {format(date, 'EEE', { locale: ru })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday ? 'text-white' : 'text-text-primary'
                      }`}>
                        {format(date, 'd')}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isToday ? 'text-white/80' : 'text-text-secondary'
                      }`}>
                        {tasks.length} задач
                      </div>
                      {hasTasks && (
                        <div className="flex justify-center gap-1 mt-1">
                          {hasOverdue && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          {hasCompleted && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analytics */}
          {taskAnalytics.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Аналитика задач</h2>
              <div className="space-y-4">
                {taskAnalytics.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTaskIcon(stat.type)}</span>
                      <div>
                        <p className="font-medium text-text-primary">{getTaskTypeName(stat.type)}</p>
                        <p className="text-sm text-text-secondary">
                          {stat.completed} из {stat.total} выполнено
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{Math.round(stat.completionRate)}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${stat.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary">
                <Plus size={16} />
                Добавить задачу
              </button>
              <button className="w-full btn btn-secondary">
                <Heart size={16} />
                Добавить питомца
              </button>
              <button 
                className="w-full btn btn-secondary"
                onClick={() => setShowTips(true)}
              >
                <BookOpen size={16} />
                Советы по уходу
              </button>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Предстоящие задачи</h2>
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-4 text-text-secondary">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет предстоящих задач</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => {
                  const pet = state.pets.find(p => p.id === task.petId);
                  
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-surface-hover rounded-lg">
                      <span className="text-lg">{getTaskIcon(task.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-text-primary">{task.title}</p>
                        <p className="text-xs text-text-secondary">
                          {pet?.name} • {format(new Date(task.scheduledTime), 'MMM d HH:mm')}
                        </p>
                      </div>
                      {getPriorityIcon(task.priority)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pet Care Tips */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Советы по уходу</h2>
            {petCareTips.length === 0 ? (
              <div className="text-center py-4 text-text-secondary">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет доступных советов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {petCareTips.slice(0, 3).map((tip) => (
                  <div 
                    key={tip.id} 
                    className="p-3 bg-surface-hover rounded-lg cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => setSelectedTip(tip)}
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen size={16} className="text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm text-text-primary">{tip.title}</h3>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Недавние достижения</h2>
              <div className="space-y-3">
                {recentAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
                    <div className="text-2xl">{achievement.icon || '🏆'}</div>
                    <div>
                      <h3 className="font-medium text-sm text-text-primary">{achievement.title}</h3>
                      {achievement.description && (
                        <p className="text-xs text-text-secondary mt-1">{achievement.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Уведомления"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Уведомления ({notifications.length})</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllNotificationsRead}
                className="btn btn-secondary btn-sm"
              >
                Отметить все как прочитанные
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Bell size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет новых уведомлений</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-surface-hover rounded-lg">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary">{notification.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                    <p className="text-xs text-text-muted mt-2">
                      {format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkNotificationRead(notification.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Отметить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Pet Care Tips Modal */}
      <Modal
        isOpen={showTips}
        onClose={() => setShowTips(false)}
        title="Советы по уходу за питомцами"
        size="lg"
      >
        <div className="space-y-4">
          {petCareTips.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет доступных советов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {petCareTips.map((tip) => (
                <div key={tip.id} className="card">
                  <div className="flex items-start gap-3">
                    <BookOpen size={20} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2">{tip.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">{tip.content}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="badge badge-primary">{tip.category}</span>
                        <span className="text-xs text-text-muted">{tip.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Individual Tip Modal */}
      {selectedTip && (
        <Modal
          isOpen={!!selectedTip}
          onClose={() => setSelectedTip(null)}
          title={selectedTip.title}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen size={24} className="text-primary mt-1" />
              <div>
                <p className="text-text-secondary leading-relaxed">{selectedTip.content}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="badge badge-primary">{selectedTip.category}</span>
                  <span className="text-sm text-text-muted">{selectedTip.type}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;