import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2,
  Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-text-secondary mt-1">
          Настройте приложение под свои предпочтения
        </p>
      </div>

      {/* General Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Общие настройки
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <div>
                <div className="font-medium">Уведомления</div>
                <div className="text-sm text-text-secondary">
                  Получать напоминания о задачах
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              <div>
                <div className="font-medium">Темная тема</div>
                <div className="text-sm text-text-secondary">
                  Переключить темный режим
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <User size={20} />
              <div>
                <div className="font-medium">Язык</div>
                <div className="text-sm text-text-secondary">
                  Выберите язык интерфейса
                </div>
              </div>
            </div>
            <select 
              className="input w-auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} />
          Управление данными
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <Download size={20} />
              <div>
                <div className="font-medium">Экспорт данных</div>
                <div className="text-sm text-text-secondary">
                  Скачать все данные в JSON формате
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm">
              Экспорт
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <Upload size={20} />
              <div>
                <div className="font-medium">Импорт данных</div>
                <div className="text-sm text-text-secondary">
                  Загрузить данные из файла
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm">
              Импорт
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <Trash2 size={20} />
              <div>
                <div className="font-medium">Очистить данные</div>
                <div className="text-sm text-text-secondary">
                  Удалить все данные приложения
                </div>
              </div>
            </div>
            <button className="btn btn-danger btn-sm">
              Очистить
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Конфиденциальность и безопасность
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-surface-hover rounded-lg">
            <div className="font-medium mb-2">Локальное хранение</div>
            <div className="text-sm text-text-secondary">
              Все данные хранятся локально на вашем устройстве. 
              Мы не собираем и не передаем вашу личную информацию.
            </div>
          </div>

          <div className="p-4 bg-surface-hover rounded-lg">
            <div className="font-medium mb-2">Резервное копирование</div>
            <div className="text-sm text-text-secondary">
              Рекомендуем регулярно экспортировать данные для создания резервных копий.
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info size={20} />
          О приложении
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Версия</div>
              <div className="text-text-secondary">1.0.0</div>
            </div>
            <div>
              <div className="font-medium">Дата сборки</div>
              <div className="text-text-secondary">
                {new Date().toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-hover rounded-lg">
            <div className="font-medium mb-2">🐾 Трекер Ухода за Питомцами</div>
            <div className="text-sm text-text-secondary">
              Приложение для отслеживания ухода за питомцами. 
              Помогает организовать расписание кормления, прогулок, игр и других важных задач.
            </div>
          </div>

          <div className="text-center text-sm text-text-secondary">
            <p>Создано с ❤️ для заботливых владельцев питомцев</p>
            <p className="mt-1">© 2024 Pet Care Tracker</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;