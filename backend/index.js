const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Pets table
    db.run(`CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      weight REAL,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      scheduledTime DATETIME NOT NULL,
      completedAt DATETIME,
      isRecurring BOOLEAN DEFAULT 0,
      recurrencePattern TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Task logs table
    db.run(`CREATE TABLE IF NOT EXISTS task_logs (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      petId TEXT NOT NULL,
      completedAt DATETIME NOT NULL,
      notes TEXT,
      duration INTEGER,
      quantity INTEGER,
      mood TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks (id),
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Shared access table
    db.run(`CREATE TABLE IF NOT EXISTS shared_access (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', 
        [userId, name, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate token
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: userId, name, email }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    });
  });
});

// Pet routes
app.get('/api/pets', authenticateToken, (req, res) => {
  db.all('SELECT * FROM pets WHERE userId = ? ORDER BY createdAt DESC', [req.user.id], (err, pets) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(pets);
  });
});

app.post('/api/pets', [
  authenticateToken,
  body('name').notEmpty().withMessage('Pet name is required'),
  body('type').isIn(['dog', 'cat', 'bird', 'fish', 'other']).withMessage('Valid pet type is required'),
  handleValidationErrors
], (req, res) => {
  const { name, type, breed, age, weight, avatar } = req.body;
  const petId = uuidv4();

  db.run('INSERT INTO pets (id, userId, name, type, breed, age, weight, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [petId, req.user.id, name, type, breed, age, weight, avatar], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating pet' });
    }

    db.get('SELECT * FROM pets WHERE id = ?', [petId], (err, pet) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching created pet' });
      }
      res.status(201).json(pet);
    });
  });
});

app.put('/api/pets/:id', [
  authenticateToken,
  body('name').notEmpty().withMessage('Pet name is required'),
  body('type').isIn(['dog', 'cat', 'bird', 'fish', 'other']).withMessage('Valid pet type is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { name, type, breed, age, weight, avatar } = req.body;

  db.run('UPDATE pets SET name = ?, type = ?, breed = ?, age = ?, weight = ?, avatar = ? WHERE id = ? AND userId = ?',
    [name, type, breed, age, weight, avatar, id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating pet' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    db.get('SELECT * FROM pets WHERE id = ?', [id], (err, pet) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching updated pet' });
      }
      res.json(pet);
    });
  });
});

app.delete('/api/pets/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM pets WHERE id = ? AND userId = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting pet' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  });
});

// Task routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { petId, date } = req.query;
  let query = 'SELECT t.*, p.name as petName FROM tasks t JOIN pets p ON t.petId = p.id WHERE p.userId = ?';
  let params = [req.user.id];

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
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tasks);
  });
});

app.post('/api/tasks', [
  authenticateToken,
  body('petId').notEmpty().withMessage('Pet ID is required'),
  body('title').notEmpty().withMessage('Task title is required'),
  body('type').isIn(['feeding', 'walk', 'play', 'treat', 'medication', 'grooming', 'vet', 'other']).withMessage('Valid task type is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  handleValidationErrors
], (req, res) => {
  const { petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes } = req.body;
  const taskId = uuidv4();

  // Verify pet belongs to user
  db.get('SELECT id FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], (err, pet) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    db.run('INSERT INTO tasks (id, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [taskId, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating task' });
      }

      db.get('SELECT t.*, p.name as petName FROM tasks t JOIN pets p ON t.petId = p.id WHERE t.id = ?', [taskId], (err, task) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching created task' });
        }
        res.status(201).json(task);
      });
    });
  });
});

app.put('/api/tasks/:id', [
  authenticateToken,
  body('title').notEmpty().withMessage('Task title is required'),
  body('type').isIn(['feeding', 'walk', 'play', 'treat', 'medication', 'grooming', 'vet', 'other']).withMessage('Valid task type is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, completedAt } = req.body;

  db.run('UPDATE tasks SET title = ?, description = ?, type = ?, scheduledTime = ?, isRecurring = ?, recurrencePattern = ?, notes = ?, completedAt = ? WHERE id = ?',
    [title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, completedAt, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.get('SELECT t.*, p.name as petName FROM tasks t JOIN pets p ON t.petId = p.id WHERE t.id = ?', [id], (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching updated task' });
      }
      res.json(task);
    });
  });
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
});

// Task completion
app.post('/api/tasks/:id/complete', [
  authenticateToken,
  body('notes').optional(),
  body('duration').optional().isInt(),
  body('quantity').optional().isInt(),
  body('mood').optional().isIn(['great', 'good', 'okay', 'bad']),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { notes, duration, quantity, mood } = req.body;
  const logId = uuidv4();
  const completedAt = new Date().toISOString();

  db.run('UPDATE tasks SET completedAt = ? WHERE id = ?', [completedAt, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error completing task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create task log
    db.get('SELECT petId FROM tasks WHERE id = ?', [id], (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching task' });
      }

      db.run('INSERT INTO task_logs (id, taskId, petId, completedAt, notes, duration, quantity, mood) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [logId, id, task.petId, completedAt, notes, duration, quantity, mood], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating task log' });
        }

        res.json({ message: 'Task completed successfully' });
      });
    });
  });
});

// Task logs
app.get('/api/task-logs', authenticateToken, (req, res) => {
  const { petId, taskId } = req.query;
  let query = 'SELECT tl.*, t.title as taskTitle, p.name as petName FROM task_logs tl JOIN tasks t ON tl.taskId = t.id JOIN pets p ON tl.petId = p.id WHERE p.userId = ?';
  let params = [req.user.id];

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
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(logs);
  });
});

// User profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, avatar, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(user);
  });
});

app.put('/api/user/profile', [
  authenticateToken,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors
], (req, res) => {
  const { name, email, avatar } = req.body;

  db.run('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?', 
    [name, email, avatar, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating profile' });
    }

    db.get('SELECT id, name, email, avatar, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching updated profile' });
      }
      res.json(user);
    });
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});