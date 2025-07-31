import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Mail, 
  Smartphone, 
  Save, 
  Edit, 
  Camera,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  Palette,
  Notifications,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, userPreferencesAPI, notificationsAPI } from '../utils/api';
import { User as UserType, UserPreferences } from '../types';
import Modal from '../components/ui/Modal';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security' | 'data'>('profile');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      reminders: true
    },
    dashboard: {
      widgets: ['tasks', 'pets', 'analytics'],
      layout: 'default'
    }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [dataExport, setDataExport] = useState({
    includePets: true,
    includeTasks: true,
    includeHistory: true,
    includeAnalytics: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userProfile, userPrefs] = await Promise.all([
        userAPI.getProfile(),
        userPreferencesAPI.get()
      ]);

      setProfileData({
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar || ''
      });

      setPreferences({
        theme: userPrefs.theme || 'light',
        notifications: userPrefs.notifications || {
          email: true,
          push: true,
          reminders: true
        },
        dashboard: userPrefs.dashboard || {
          widgets: ['tasks', 'pets', 'analytics'],
          layout: 'default'
        }
      });
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim() || !profileData.email.trim()) {
      showNotification('error', 'Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await userAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar
      });

      setShowEditProfile(false);
      showNotification('success', 'Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setSaving(true);
      await userPreferencesAPI.update(preferences);
      
      // Update theme if changed
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
      
      showNotification('success', 'Preferences Saved', 'Your preferences have been saved successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      showNotification('error', 'Error', 'Please fill in all password fields');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      showNotification('error', 'Error', 'New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      showNotification('error', 'Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      // Here you would call the API to change password
      // await userAPI.changePassword(securityData.currentPassword, securityData.newPassword);
      
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
      
      showNotification('success', 'Password Changed', 'Your password has been changed successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      // Here you would call the API to export data
      // const data = await userAPI.exportData(dataExport);
      
      // Create and download file
      const exportData = {
        user: profileData,
        preferences,
        exportDate: new Date().toISOString(),
        settings: dataExport
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pet-care-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Data Exported', 'Your data has been exported successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to export data');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      // Here you would call the API to delete account
      // await userAPI.deleteAccount();
      
      showNotification('success', 'Account Deleted', 'Your account has been deleted');
      logout();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete account');
    } finally {
      setSaving(false);
      setShowDeleteAccount(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-text-primary">Настройки</h1>
          <p className="text-text-secondary mt-1">
            Управляйте своим профилем и настройками
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="card">
        <div className="flex border-b border-border">
          {[
            { id: 'profile', label: 'Профиль', icon: User },
            { id: 'preferences', label: 'Предпочтения', icon: Palette },
            { id: 'notifications', label: 'Уведомления', icon: Notifications },
            { id: 'security', label: 'Безопасность', icon: Shield },
            { id: 'data', label: 'Данные', icon: Download }
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
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-primary" />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-full">
                    <Camera size={12} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{profileData.name}</h3>
                  <p className="text-text-secondary">{profileData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Имя</label>
                  <input
                    type="text"
                    className="input"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL аватара</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <div className="loading"></div> : <Save size={16} />}
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Внешний вид</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Тема</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          preferences.theme === 'light'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-surface-hover'
                        }`}
                      >
                        <Sun size={16} />
                        Светлая
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          preferences.theme === 'dark'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-surface-hover'
                        }`}
                      >
                        <Moon size={16} />
                        Темная
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Панель управления</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Виджеты</label>
                    <div className="space-y-2">
                      {['tasks', 'pets', 'analytics', 'notifications', 'tips'].map((widget) => (
                        <label key={widget} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={preferences.dashboard?.widgets?.includes(widget)}
                            onChange={(e) => {
                              const widgets = preferences.dashboard?.widgets || [];
                              if (e.target.checked) {
                                setPreferences({
                                  ...preferences,
                                  dashboard: {
                                    ...preferences.dashboard,
                                    widgets: [...widgets, widget]
                                  }
                                });
                              } else {
                                setPreferences({
                                  ...preferences,
                                  dashboard: {
                                    ...preferences.dashboard,
                                    widgets: widgets.filter(w => w !== widget)
                                  }
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{widget}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdatePreferences}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <div className="loading"></div> : <Save size={16} />}
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Настройки уведомлений</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-text-primary">Email уведомления</p>
                        <p className="text-sm text-text-secondary">Получать уведомления на email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.email}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-text-primary">Push уведомления</p>
                        <p className="text-sm text-text-secondary">Получать push уведомления</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.push}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-text-primary">Напоминания</p>
                        <p className="text-sm text-text-secondary">Получать напоминания о задачах</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.reminders}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          reminders: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdatePreferences}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <div className="loading"></div> : <Save size={16} />}
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Смена пароля</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Текущий пароль</label>
                    <div className="relative">
                      <input
                        type={securityData.showCurrentPassword ? 'text' : 'password'}
                        className="input pr-10"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSecurityData({ ...securityData, showCurrentPassword: !securityData.showCurrentPassword })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {securityData.showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Новый пароль</label>
                    <div className="relative">
                      <input
                        type={securityData.showNewPassword ? 'text' : 'password'}
                        className="input pr-10"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSecurityData({ ...securityData, showNewPassword: !securityData.showNewPassword })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {securityData.showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Подтвердите новый пароль</label>
                    <div className="relative">
                      <input
                        type={securityData.showConfirmPassword ? 'text' : 'password'}
                        className="input pr-10"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSecurityData({ ...securityData, showConfirmPassword: !securityData.showConfirmPassword })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {securityData.showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? <div className="loading"></div> : <Lock size={16} />}
                    Сменить пароль
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Экспорт данных</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { key: 'includePets', label: 'Данные питомцев' },
                      { key: 'includeTasks', label: 'Задачи и расписание' },
                      { key: 'includeHistory', label: 'История и логи' },
                      { key: 'includeAnalytics', label: 'Аналитика и статистика' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={dataExport[key as keyof typeof dataExport]}
                          onChange={(e) => setDataExport({
                            ...dataExport,
                            [key]: e.target.checked
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleExportData}
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? <div className="loading"></div> : <Download size={16} />}
                    Экспортировать данные
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Удаление аккаунта</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Это действие нельзя отменить. Все ваши данные будут удалены навсегда.
                </p>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} />
                  Удалить аккаунт
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title="Редактировать профиль"
        size="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Имя *</label>
            <input
              type="text"
              className="input"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              className="input"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL аватара</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com/avatar.jpg"
              value={profileData.avatar}
              onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setShowEditProfile(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving}
            >
              {saving ? <div className="loading"></div> : <Save size={16} />}
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        title="Удалить аккаунт"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Вы уверены?</h3>
            <p className="text-text-secondary">
              Это действие нельзя отменить. Все ваши данные, включая питомцев, задачи и историю, будут удалены навсегда.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setShowDeleteAccount(false)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-danger flex-1"
              onClick={handleDeleteAccount}
              disabled={saving}
            >
              {saving ? <div className="loading"></div> : <Trash2 size={16} />}
              Удалить аккаунт
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;