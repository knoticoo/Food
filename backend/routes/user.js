const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const query = 'SELECT id, name, email, avatar, createdAt FROM users WHERE id = ?';
  
  db.get(query, [req.user.id], (err, user) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('avatar').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, avatar } = req.body;
  
  // Check if email is already taken by another user
  db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id], (err, existingUser) => {
    if (err) {
      console.error('Error checking email uniqueness:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already taken' });
    }
    
    const query = `
      UPDATE users 
      SET name = ?, email = ?, avatar = ?, updatedAt = datetime('now')
      WHERE id = ?
    `;
    
    db.run(query, [name, email, avatar, req.user.id], function(err) {
      if (err) {
        console.error('Error updating user profile:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      
      // Get the updated user
      db.get('SELECT id, name, email, avatar, createdAt FROM users WHERE id = ?', [req.user.id], (err, updatedUser) => {
        if (err) {
          console.error('Error fetching updated user:', err);
          return res.status(500).json({ error: 'Failed to fetch updated user' });
        }
        res.json(updatedUser);
      });
    });
  });
});

module.exports = router;