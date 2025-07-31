const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Get all pets for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT * FROM pets 
    WHERE userId = ? 
    ORDER BY createdAt DESC
  `;
  
  db.all(query, [req.user.id], (err, pets) => {
    if (err) {
      console.error('Error fetching pets:', err);
      return res.status(500).json({ error: 'Failed to fetch pets' });
    }
    res.json(pets);
  });
});

// Create a new pet
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('type').isIn(['dog', 'cat', 'bird', 'fish', 'other']).withMessage('Invalid pet type'),
  body('breed').optional().trim(),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, type, breed, age, weight, avatar } = req.body;
  const query = `
    INSERT INTO pets (userId, name, type, breed, age, weight, avatar, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  db.run(query, [req.user.id, name, type, breed, age, weight, avatar], function(err) {
    if (err) {
      console.error('Error creating pet:', err);
      return res.status(500).json({ error: 'Failed to create pet' });
    }
    
    // Get the created pet
    db.get('SELECT * FROM pets WHERE id = ?', [this.lastID], (err, pet) => {
      if (err) {
        console.error('Error fetching created pet:', err);
        return res.status(500).json({ error: 'Failed to fetch created pet' });
      }
      res.status(201).json(pet);
    });
  });
});

// Update a pet
router.put('/:id', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('type').isIn(['dog', 'cat', 'bird', 'fish', 'other']).withMessage('Invalid pet type'),
  body('breed').optional().trim(),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, type, breed, age, weight, avatar } = req.body;
  const petId = req.params.id;
  
  // First check if pet belongs to user
  db.get('SELECT * FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], (err, pet) => {
    if (err) {
      console.error('Error checking pet ownership:', err);
      return res.status(500).json({ error: 'Failed to update pet' });
    }
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const query = `
      UPDATE pets 
      SET name = ?, type = ?, breed = ?, age = ?, weight = ?, avatar = ?, updatedAt = datetime('now')
      WHERE id = ? AND userId = ?
    `;
    
    db.run(query, [name, type, breed, age, weight, avatar, petId, req.user.id], function(err) {
      if (err) {
        console.error('Error updating pet:', err);
        return res.status(500).json({ error: 'Failed to update pet' });
      }
      
      // Get the updated pet
      db.get('SELECT * FROM pets WHERE id = ?', [petId], (err, updatedPet) => {
        if (err) {
          console.error('Error fetching updated pet:', err);
          return res.status(500).json({ error: 'Failed to fetch updated pet' });
        }
        res.json(updatedPet);
      });
    });
  });
});

// Delete a pet
router.delete('/:id', authenticateToken, (req, res) => {
  const petId = req.params.id;
  
  // First check if pet belongs to user
  db.get('SELECT * FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], (err, pet) => {
    if (err) {
      console.error('Error checking pet ownership:', err);
      return res.status(500).json({ error: 'Failed to delete pet' });
    }
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    // Delete related tasks and logs first
    db.run('DELETE FROM tasks WHERE petId = ?', [petId], (err) => {
      if (err) {
        console.error('Error deleting pet tasks:', err);
        return res.status(500).json({ error: 'Failed to delete pet' });
      }
      
      db.run('DELETE FROM taskLogs WHERE petId = ?', [petId], (err) => {
        if (err) {
          console.error('Error deleting pet logs:', err);
          return res.status(500).json({ error: 'Failed to delete pet' });
        }
        
        // Now delete the pet
        db.run('DELETE FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], function(err) {
          if (err) {
            console.error('Error deleting pet:', err);
            return res.status(500).json({ error: 'Failed to delete pet' });
          }
          
          res.json({ message: 'Pet deleted successfully' });
        });
      });
    });
  });
});

module.exports = router;