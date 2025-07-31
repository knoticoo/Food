import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Heart, Activity, X, Save } from 'lucide-react';
import { petsAPI } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { Pet } from '../types';

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as 'dog' | 'cat' | 'bird' | 'fish' | 'other',
    breed: '',
    age: '',
    weight: '',
    avatar: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await petsAPI.getAll();
      setPets(data);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

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
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'bird': return 'Bird';
      case 'fish': return 'Fish';
      default: return 'Other';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      weight: '',
      avatar: ''
    });
  };

  const handleAddPet = async () => {
    if (!formData.name.trim()) {
      showNotification('error', 'Error', 'Pet name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPet = await petsAPI.create({
        name: formData.name,
        type: formData.type,
        breed: formData.breed || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        avatar: formData.avatar || undefined
      });

      setPets([newPet, ...pets]);
      setShowAddModal(false);
      resetForm();
      showNotification('success', 'Success', 'Pet added successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to add pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPet = async () => {
    if (!editingPet || !formData.name.trim()) {
      showNotification('error', 'Error', 'Pet name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedPet = await petsAPI.update(editingPet.id, {
        name: formData.name,
        type: formData.type,
        breed: formData.breed || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        avatar: formData.avatar || undefined
      });

      setPets(pets.map(pet => pet.id === editingPet.id ? updatedPet : pet));
      setEditingPet(null);
      resetForm();
      showNotification('success', 'Success', 'Pet updated successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to update pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      await petsAPI.delete(petId);
      setPets(pets.filter(pet => pet.id !== petId));
      showNotification('success', 'Success', 'Pet deleted successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete pet');
    }
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      weight: pet.weight?.toString() || '',
      avatar: pet.avatar || ''
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPet(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-600 mt-1">
            Manage your pets information
          </p>
        </div>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Add Pet
        </button>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">No pets yet</h2>
          <p className="text-gray-600 mb-6">
            Add your first pet to start tracking care
          </p>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getPetIcon(pet.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-600">
                      {getPetTypeName(pet.type)}
                      {pet.breed && ` • ${pet.breed}`}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {pet.age && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Age:</span> {pet.age} years
                  </p>
                )}
                {pet.weight && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Weight:</span> {pet.weight} kg
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(pet)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePet(pet.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingPet) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingPet ? handleEditPet() : handleAddPet();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter pet name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter breed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Age"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Weight"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPet ? 'Update' : 'Add Pet'}
                    </>
                  )}
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