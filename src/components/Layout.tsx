import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  Calendar, 
  History, 
  Settings,
  Plus
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { useNotification } from '../context/NotificationContext';
import Modal from './Modal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePetContext();
  const { showNotification } = useNotification();
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const navigation = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Питомцы', href: '/pets', icon: Heart },
    { name: 'Задачи', href: '/tasks', icon: Calendar },
    { name: 'История', href: '/history', icon: History },
    { name: 'Настройки', href: '/settings', icon: Settings },
  ];

  const handleAddPet = () => {
    navigate('/pets');
    showNotification('info', 'Добавление питомца', 'Переходим на страницу питомцев для добавления нового питомца.');
  };

  const handleAddTask = () => {
    navigate('/tasks');
    showNotification('info', 'Новая задача', 'Переходим на страницу задач для создания новой задачи.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🐾</div>
              <h1 className="text-xl font-semibold">Трекер Питомцев</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">
                {state.pets.length} питомцев
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-border min-h-screen shadow-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Быстрые действия
              </h3>
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-all duration-200"
                  onClick={handleAddPet}
                >
                  <Plus size={20} />
                  <span>Добавить питомца</span>
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-all duration-200"
                  onClick={handleAddTask}
                >
                  <Plus size={20} />
                  <span>Новая задача</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;