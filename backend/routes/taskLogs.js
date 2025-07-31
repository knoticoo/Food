const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Get all task logs for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const { petId, taskId } = req.query;
  let query = `
    SELECT tl.*, t.title as taskTitle, t.type as taskType, p.name as petName, p.type as petType
    FROM taskLogs tl
    JOIN tasks t ON tl.taskId = t.id
    JOIN pets p ON tl.petId = p.id
    WHERE tl.userId = ?
  `;
  const params = [req.user.id];
  
  if (petId) {
    query += ' AND tl.petId = ?';
    params.push(petId);
  }
  
  if (taskId) {
    query += ' AND tl.taskId = ?';
    params.push(taskId);
  }
  
  query += ' ORDER BY tl.completedAt DESC';
  
  db.all(query, params, (err, logs) => {
    if (err) {
      console.error('Error fetching task logs:', err);
      return res.status(500).json({ error: 'Failed to fetch task logs' });
    }
    res.json(logs);
  });
});

module.exports = router;