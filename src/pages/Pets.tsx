import React, { useState } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Heart, Activity } from 'lucide-react';
import { usePetContext } from '../context/PetContext';
import { Pet } from '../types';

const Pets: React.FC = () => {
  const { state, dispatch } = usePetContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  const getPetTypeName = (type: string) => {
    switch (type) {
      case 'dog': return 'Собака';
      case 'cat': return 'Кошка';
      case 'bird': return 'Птица';
      case 'fish': return 'Рыбка';
      default: return 'Другое';
    }
  };

  const handleAddPet = () => {
    const newPet: Pet = {
      id: Date.now().toString(),
      name: 'Новый питомец',
      type: 'dog',
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_PET', payload: newPet });
    setShowAddModal(false);
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого питомца?')) {
      dispatch({ type: 'DELETE_PET', payload: petId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои питомцы</h1>
          <p className="text-text-secondary mt-1">
            Управляйте информацией о ваших питомцах
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Добавить питомца
        </button>
      </div>

      {/* Pets Grid */}
      {state.pets.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold mb-2">Нет питомцев</h2>
          <p className="text-text-secondary mb-6">
            Добавьте своего первого питомца, чтобы начать отслеживать уход
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Добавить питомца
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.pets.map((pet) => {
            const petTasks = state.tasks.filter(task => task.petId === pet.id);
            const completedTasks = petTasks.filter(task => task.completedAt);
            const pendingTasks = petTasks.filter(task => !task.completedAt);
            
            return (
              <div key={pet.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getPetIcon(pet.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{pet.name}</h3>
                      <p className="text-sm text-text-secondary">
                        {getPetTypeName(pet.type)}
                        {pet.breed && ` • ${pet.breed}`}
                      </p>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-secondary btn-sm">
                      <MoreVertical size={16} />
                    </button>
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => setEditingPet(pet)}
                      >
                        <Edit size={16} />
                        Редактировать
                      </button>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pet Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-surface-hover rounded-lg">
                    <div className="text-lg font-bold text-success">
                      {completedTasks.length}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Выполнено
                    </div>
                  </div>
                  <div className="text-center p-3 bg-surface-hover rounded-lg">
                    <div className="text-lg font-bold text-warning">
                      {pendingTasks.length}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Ожидают
                    </div>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="space-y-2 text-sm">
                  {pet.age && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Возраст:</span>
                      <span>{pet.age} лет</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Вес:</span>
                      <span>{pet.weight} кг</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Добавлен:</span>
                    <span>{pet.createdAt.toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button className="btn btn-secondary btn-sm flex-1">
                    <Activity size={16} />
                    Задачи
                  </button>
                  <button className="btn btn-secondary btn-sm flex-1">
                    <Heart size={16} />
                    История
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Добавить питомца</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddPet();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Имя питомца
                  </label>
                  <input 
                    type="text" 
                    className="input"
                    placeholder="Введите имя"
                    defaultValue="Новый питомец"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тип питомца
                  </label>
                  <select className="input">
                    <option value="dog">Собака</option>
                    <option value="cat">Кошка</option>
                    <option value="bird">Птица</option>
                    <option value="fish">Рыбка</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Порода (необязательно)
                  </label>
                  <input 
                    type="text" 
                    className="input"
                    placeholder="Например: Лабрадор"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Возраст (лет)
                    </label>
                    <input 
                      type="number" 
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Вес (кг)
                    </label>
                    <input 
                      type="number" 
                      className="input"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;