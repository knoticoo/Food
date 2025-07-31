import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, X, Save, Camera, Award, TrendingUp, Heart, Calendar, Smile } from 'lucide-react';
import { petsAPI } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Pet, PetPhoto, PetMilestone, PetWeightLog, PetMoodLog, PetAchievement } from '../types';
import Modal from '../components/ui/Modal';

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPetDetails, setShowPetDetails] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petPhotos, setPetPhotos] = useState<PetPhoto[]>([]);
  const [petMilestones, setPetMilestones] = useState<PetMilestone[]>([]);
  const [petWeightLogs, setPetWeightLogs] = useState<PetWeightLog[]>([]);
  const [petMoodLogs, setPetMoodLogs] = useState<PetMoodLog[]>([]);
  const [petAchievements, setPetAchievements] = useState<PetAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'milestones' | 'weight' | 'mood' | 'achievements'>('overview');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as 'dog' | 'cat' | 'bird' | 'fish' | 'other',
    breed: '',
    age: '',
    weight: '',
    avatar: '',
    favoriteToys: '',
    allergies: '',
    specialNeeds: '',
    adoptionDate: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showMoodForm, setShowMoodForm] = useState(false);

  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();

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

  const loadPetDetails = async (petId: string) => {
    try {
      const [photos, milestones, weightLogs, moodLogs, achievements] = await Promise.all([
        petsAPI.getPhotos(petId),
        petsAPI.getMilestones(petId),
        petsAPI.getWeightLogs(petId),
        petsAPI.getMoodLogs(petId),
        petsAPI.getAchievements(petId)
      ]);
      
      setPetPhotos(photos);
      setPetMilestones(milestones);
      setPetWeightLogs(weightLogs);
      setPetMoodLogs(moodLogs);
      setPetAchievements(achievements);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load pet details');
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
      avatar: '',
      favoriteToys: '',
      allergies: '',
      specialNeeds: '',
      adoptionDate: ''
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
        avatar: formData.avatar || undefined,
        favoriteToys: formData.favoriteToys || undefined,
        allergies: formData.allergies || undefined,
        specialNeeds: formData.specialNeeds || undefined,
        adoptionDate: formData.adoptionDate || undefined
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
        avatar: formData.avatar || undefined,
        favoriteToys: formData.favoriteToys || undefined,
        allergies: formData.allergies || undefined,
        specialNeeds: formData.specialNeeds || undefined,
        adoptionDate: formData.adoptionDate || undefined
      });

      setPets(pets.map(pet => pet.id === editingPet.id ? updatedPet : pet));
      setShowAddModal(false);
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
    if (!confirm('Are you sure you want to delete this pet?')) return;

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
      avatar: pet.avatar || '',
      favoriteToys: pet.favoriteToys || '',
      allergies: pet.allergies || '',
      specialNeeds: pet.specialNeeds || '',
      adoptionDate: pet.adoptionDate || ''
    });
    setShowAddModal(true);
  };

  const openPetDetails = async (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetDetails(true);
    setActiveTab('overview');
    await loadPetDetails(pet.id);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowPetDetails(false);
    setEditingPet(null);
    setSelectedPet(null);
    resetForm();
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
          <h1 className="text-3xl font-bold text-text-primary">My Pets</h1>
          <p className="text-text-secondary mt-1">Manage your beloved pets</p>
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
            Add Pet
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">No pets yet</h2>
          <p className="text-text-secondary mb-6">Add your first pet to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="card hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getPetIcon(pet.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{pet.name}</h3>
                    <p className="text-text-secondary">{getPetTypeName(pet.type)}</p>
                  </div>
                </div>
                <div className="dropdown">
                  <button className="theme-toggle">
                    <MoreVertical size={16} />
                  </button>
                  <div className="dropdown-menu">
                    <button
                      onClick={() => openPetDetails(pet)}
                      className="dropdown-item"
                    >
                      <Edit size={16} />
                      View Details
                    </button>
                    <button
                      onClick={() => openEditModal(pet)}
                      className="dropdown-item"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="dropdown-item text-danger"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {pet.breed && (
                  <p className="text-sm text-text-secondary">Breed: {pet.breed}</p>
                )}
                {pet.age && (
                  <p className="text-sm text-text-secondary">Age: {pet.age} years</p>
                )}
                {pet.weight && (
                  <p className="text-sm text-text-secondary">Weight: {pet.weight} kg</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => openPetDetails(pet)}
                  className="btn btn-secondary w-full"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Pet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingPet ? 'Edit Pet' : 'Add New Pet'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); editingPet ? handleEditPet() : handleAddPet(); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dog' | 'cat' | 'bird' | 'fish' | 'other' })}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Breed</label>
                <input
                  type="text"
                  className="input"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Age (years)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Adoption Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.adoptionDate}
                  onChange={(e) => setFormData({ ...formData, adoptionDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Favorite Toys</label>
              <input
                type="text"
                className="input"
                value={formData.favoriteToys}
                onChange={(e) => setFormData({ ...formData, favoriteToys: e.target.value })}
                placeholder="e.g., Tennis ball, squeaky toy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Allergies</label>
              <input
                type="text"
                className="input"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g., Peanuts, chicken"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Needs</label>
              <textarea
                className="input"
                rows={3}
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                placeholder="Any special care requirements..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={closeModal}
            >
              Cancel
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
                  {editingPet ? 'Update Pet' : 'Add Pet'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pet Details Modal */}
      {selectedPet && (
        <Modal
          isOpen={showPetDetails}
          onClose={() => setShowPetDetails(false)}
          title={`${selectedPet.name}'s Profile`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'overview', label: 'Overview', icon: Heart },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: 'milestones', label: 'Milestones', icon: Calendar },
                { id: 'weight', label: 'Weight', icon: TrendingUp },
                { id: 'mood', label: 'Mood', icon: Smile },
                { id: 'achievements', label: 'Achievements', icon: Award }
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
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedPet.name}</p>
                        <p><span className="font-medium">Type:</span> {getPetTypeName(selectedPet.type)}</p>
                        {selectedPet.breed && <p><span className="font-medium">Breed:</span> {selectedPet.breed}</p>}
                        {selectedPet.age && <p><span className="font-medium">Age:</span> {selectedPet.age} years</p>}
                        {selectedPet.weight && <p><span className="font-medium">Weight:</span> {selectedPet.weight} kg</p>}
                        {selectedPet.adoptionDate && <p><span className="font-medium">Adoption Date:</span> {new Date(selectedPet.adoptionDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Care Details</h3>
                      <div className="space-y-2">
                        {selectedPet.favoriteToys && <p><span className="font-medium">Favorite Toys:</span> {selectedPet.favoriteToys}</p>}
                        {selectedPet.allergies && <p><span className="font-medium">Allergies:</span> {selectedPet.allergies}</p>}
                        {selectedPet.specialNeeds && <p><span className="font-medium">Special Needs:</span> {selectedPet.specialNeeds}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Photo Gallery</h3>
                    <button
                      onClick={() => setShowPhotoUpload(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Camera size={16} />
                      Add Photo
                    </button>
                  </div>
                  
                  {petPhotos.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Camera size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No photos yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {petPhotos.map((photo) => (
                        <div key={photo.id} className="aspect-square bg-surface rounded-lg overflow-hidden">
                          <img
                            src={photo.photoUrl}
                            alt={photo.caption || 'Pet photo'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Milestones</h3>
                    <button
                      onClick={() => setShowMilestoneForm(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={16} />
                      Add Milestone
                    </button>
                  </div>
                  
                  {petMilestones.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No milestones yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {petMilestones.map((milestone) => (
                        <div key={milestone.id} className="card">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{milestone.title}</h4>
                              {milestone.description && <p className="text-text-secondary text-sm mt-1">{milestone.description}</p>}
                              <p className="text-text-muted text-xs mt-2">{new Date(milestone.milestoneDate).toLocaleDateString()}</p>
                            </div>
                            <span className="badge badge-primary">{milestone.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'weight' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Weight Tracking</h3>
                    <button
                      onClick={() => setShowWeightForm(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={16} />
                      Log Weight
                    </button>
                  </div>
                  
                  {petWeightLogs.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No weight logs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {petWeightLogs.map((log) => (
                        <div key={log.id} className="card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{log.weight} kg</p>
                              {log.notes && <p className="text-text-secondary text-sm mt-1">{log.notes}</p>}
                              <p className="text-text-muted text-xs mt-2">{new Date(log.measuredAt).toLocaleDateString()}</p>
                            </div>
                            <TrendingUp size={20} className="text-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mood' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Mood Tracking</h3>
                    <button
                      onClick={() => setShowMoodForm(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={16} />
                      Log Mood
                    </button>
                  </div>
                  
                  {petMoodLogs.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Smile size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No mood logs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {petMoodLogs.map((log) => (
                        <div key={log.id} className="card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold capitalize">{log.mood}</p>
                              {log.notes && <p className="text-text-secondary text-sm mt-1">{log.notes}</p>}
                              <p className="text-text-muted text-xs mt-2">{new Date(log.loggedAt).toLocaleDateString()}</p>
                            </div>
                            <Smile size={20} className="text-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Achievements</h3>
                  
                  {petAchievements.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <Award size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No achievements yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {petAchievements.map((achievement) => (
                        <div key={achievement.id} className="card">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{achievement.icon || '🏆'}</div>
                            <div>
                              <h4 className="font-semibold">{achievement.title}</h4>
                              {achievement.description && <p className="text-text-secondary text-sm mt-1">{achievement.description}</p>}
                              <p className="text-text-muted text-xs mt-2">{new Date(achievement.earnedAt).toLocaleDateString()}</p>
                            </div>
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
    </div>
  );
};

export default Pets;