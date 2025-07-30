import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PawPrint, 
  Calendar, 
  History, 
  Settings,
  Plus
} from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import logger from '../utils/logger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  logger.log('🏗️ Layout component rendering...');
  const location = useLocation();
  const { state } = usePetContext();

  logger.log('📍 Current location:', location.pathname);
  logger.log('🐕 Pets in state:', state.pets.length);
  logger.log('📋 Tasks in state:', state.tasks.length);

  const navigation = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Питомцы', href: '/pets', icon: PawPrint },
    { name: 'Задачи', href: '/tasks', icon: Calendar },
    { name: 'История', href: '/history', icon: History },
    { name: 'Настройки', href: '/settings', icon: Settings },
  ];

  logger.log('🧭 Navigation items:', navigation.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Debug indicator */}
      <div style={{ 
        position: 'fixed', 
        top: '0', 
        right: '0', 
        background: 'blue', 
        color: 'white', 
        padding: '5px', 
        zIndex: 9998,
        fontSize: '12px'
      }}>
        Layout rendering - {state.pets.length} pets
      </div>
      
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="container">
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
        <aside className="w-64 bg-surface border-r border-border min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
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
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-colors">
                  <Plus size={20} />
                  <span>Добавить питомца</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-colors">
                  <Plus size={20} />
                  <span>Новая задача</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;