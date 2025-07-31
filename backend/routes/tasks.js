const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Get all tasks for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const { petId, date } = req.query;
  let query = `
    SELECT t.*, p.name as petName, p.type as petType 
    FROM tasks t
    JOIN pets p ON t.petId = p.id
    WHERE t.userId = ?
  `;
  const params = [req.user.id];
  
  if (petId) {
    query += ' AND t.petId = ?';
    params.push(petId);
  }
  
  if (date) {
    query += ' AND DATE(t.scheduledTime) = DATE(?)';
    params.push(date);
  }
  
  query += ' ORDER BY t.scheduledTime ASC';
  
  db.all(query, params, (err, tasks) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

// Create a new task
router.post('/', authenticateToken, [
  body('petId').trim().isLength({ min: 1 }).withMessage('Pet ID is required'),
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['feeding', 'walk', 'play', 'treat', 'medication', 'grooming', 'vet', 'other']).withMessage('Invalid task type'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('description').optional().trim(),
  body('isRecurring').optional().isBoolean(),
  body('recurrencePattern').optional().isIn(['daily', 'weekly', 'monthly']),
  body('notes').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes } = req.body;
  
  // First check if pet belongs to user
  db.get('SELECT * FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], (err, pet) => {
    if (err) {
      console.error('Error checking pet ownership:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const query = `
      INSERT INTO tasks (userId, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    db.run(query, [req.user.id, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes], function(err) {
      if (err) {
        console.error('Error creating task:', err);
        return res.status(500).json({ error: 'Failed to create task' });
      }
      
      // Get the created task with pet info
      const selectQuery = `
        SELECT t.*, p.name as petName, p.type as petType 
        FROM tasks t
        JOIN pets p ON t.petId = p.id
        WHERE t.id = ?
      `;
      
      db.get(selectQuery, [this.lastID], (err, task) => {
        if (err) {
          console.error('Error fetching created task:', err);
          return res.status(500).json({ error: 'Failed to fetch created task' });
        }
        res.status(201).json(task);
      });
    });
  });
});

// Update a task
router.put('/:id', authenticateToken, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['feeding', 'walk', 'play', 'treat', 'medication', 'grooming', 'vet', 'other']).withMessage('Invalid task type'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('description').optional().trim(),
  body('isRecurring').optional().isBoolean(),
  body('recurrencePattern').optional().isIn(['daily', 'weekly', 'monthly']),
  body('notes').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, type, scheduledTime, isRecurring, recurrencePattern, notes } = req.body;
  const taskId = req.params.id;
  
  // First check if task belongs to user
  db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, req.user.id], (err, task) => {
    if (err) {
      console.error('Error checking task ownership:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, type = ?, scheduledTime = ?, isRecurring = ?, recurrencePattern = ?, notes = ?, updatedAt = datetime('now')
      WHERE id = ? AND userId = ?
    `;
    
    db.run(query, [title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, taskId, req.user.id], function(err) {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      
      // Get the updated task with pet info
      const selectQuery = `
        SELECT t.*, p.name as petName, p.type as petType 
        FROM tasks t
        JOIN pets p ON t.petId = p.id
        WHERE t.id = ?
      `;
      
      db.get(selectQuery, [taskId], (err, updatedTask) => {
        if (err) {
          console.error('Error fetching updated task:', err);
          return res.status(500).json({ error: 'Failed to fetch updated task' });
        }
        res.json(updatedTask);
      });
    });
  });
});

// Complete a task
router.post('/:id/complete', authenticateToken, [
  body('notes').optional().trim(),
  body('duration').optional().isInt({ min: 0 }),
  body('quantity').optional().isFloat({ min: 0 }),
  body('mood').optional().isIn(['great', 'good', 'okay', 'bad']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { notes, duration, quantity, mood } = req.body;
  const taskId = req.params.id;
  
  // First check if task belongs to user
  db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, req.user.id], (err, task) => {
    if (err) {
      console.error('Error checking task ownership:', err);
      return res.status(500).json({ error: 'Failed to complete task' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.completedAt) {
      return res.status(400).json({ error: 'Task is already completed' });
    }
    
    // Update task as completed
    const updateQuery = `
      UPDATE tasks 
      SET completedAt = datetime('now'), updatedAt = datetime('now')
      WHERE id = ? AND userId = ?
    `;
    
    db.run(updateQuery, [taskId, req.user.id], function(err) {
      if (err) {
        console.error('Error completing task:', err);
        return res.status(500).json({ error: 'Failed to complete task' });
      }
      
      // Create task log
      const logQuery = `
        INSERT INTO taskLogs (userId, petId, taskId, notes, duration, quantity, mood, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(logQuery, [req.user.id, task.petId, taskId, notes, duration, quantity, mood], function(err) {
        if (err) {
          console.error('Error creating task log:', err);
          return res.status(500).json({ error: 'Failed to complete task' });
        }
        
        // Get the completed task with pet info
        const selectQuery = `
          SELECT t.*, p.name as petName, p.type as petType 
          FROM tasks t
          JOIN pets p ON t.petId = p.id
          WHERE t.id = ?
        `;
        
        db.get(selectQuery, [taskId], (err, completedTask) => {
          if (err) {
            console.error('Error fetching completed task:', err);
            return res.status(500).json({ error: 'Failed to fetch completed task' });
          }
          res.json(completedTask);
        });
      });
    });
  });
});

// Delete a task
router.delete('/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  
  // First check if task belongs to user
  db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, req.user.id], (err, task) => {
    if (err) {
      console.error('Error checking task ownership:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete related logs first
    db.run('DELETE FROM taskLogs WHERE taskId = ?', [taskId], (err) => {
      if (err) {
        console.error('Error deleting task logs:', err);
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      
      // Now delete the task
      db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [taskId, req.user.id], function(err) {
        if (err) {
          console.error('Error deleting task:', err);
          return res.status(500).json({ error: 'Failed to delete task' });
        }
        
        res.json({ message: 'Task deleted successfully' });
      });
    });
  });
});

module.exports = router;