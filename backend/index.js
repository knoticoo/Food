const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const path = require('path');
const crypto = require('crypto'); // Added for crypto.randomUUID()

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
      preferences TEXT DEFAULT '{}',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Pets table - enhanced with more fields
    db.run(`CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      weight REAL,
      avatar TEXT,
      favoriteToys TEXT,
      allergies TEXT,
      specialNeeds TEXT,
      adoptionDate TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Pet photos table
    db.run(`CREATE TABLE IF NOT EXISTS pet_photos (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      photoUrl TEXT NOT NULL,
      caption TEXT,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Pet milestones table
    db.run(`CREATE TABLE IF NOT EXISTS pet_milestones (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      milestoneDate TEXT NOT NULL,
      type TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Pet weight tracking table
    db.run(`CREATE TABLE IF NOT EXISTS pet_weight_logs (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      weight REAL NOT NULL,
      measuredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Pet mood tracking table
    db.run(`CREATE TABLE IF NOT EXISTS pet_mood_logs (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT,
      loggedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Tasks table - enhanced with priority and attachments
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      scheduledTime DATETIME NOT NULL,
      completedAt DATETIME,
      isRecurring BOOLEAN DEFAULT 0,
      recurrencePattern TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Task attachments table
    db.run(`CREATE TABLE IF NOT EXISTS task_attachments (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      fileUrl TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileType TEXT,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks (id)
    )`);

    // Task comments table
    db.run(`CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      userId TEXT NOT NULL,
      comment TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks (id),
      FOREIGN KEY (userId) REFERENCES users (id)
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

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      relatedId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Pet achievements table
    db.run(`CREATE TABLE IF NOT EXISTS pet_achievements (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      earnedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      icon TEXT,
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

    // Pet care tips table
    db.run(`CREATE TABLE IF NOT EXISTS pet_care_tips (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample data
    db.run(`INSERT OR IGNORE INTO pet_care_tips (id, type, title, content, category) VALUES 
      ('tip-1', 'dog', 'Регулярные прогулки', 'Собаки нуждаются в ежедневных прогулках для физической активности и социализации. Рекомендуется минимум 30 минут в день.', 'exercise'),
      ('tip-2', 'cat', 'Правильное питание', 'Кошки должны получать сбалансированное питание с достаточным количеством белка. Всегда обеспечивайте свежую воду.', 'nutrition'),
      ('tip-3', 'dog', 'Уход за шерстью', 'Регулярное расчесывание помогает поддерживать здоровье шерсти и кожи вашей собаки.', 'grooming'),
      ('tip-4', 'cat', 'Игровая активность', 'Кошки нуждаются в умственной стимуляции. Используйте игрушки и игровые сессии для поддержания активности.', 'activity'),
      ('tip-5', 'dog', 'Социализация', 'Приучайте щенка к общению с другими собаками и людьми с раннего возраста.', 'training')
    `);

    // Insert sample notifications
    db.run(`INSERT OR IGNORE INTO notifications (id, userId, type, title, message) VALUES 
      ('notif-1', 'user-1', 'reminder', 'Время кормления', 'Не забудьте покормить Бобика в 18:00'),
      ('notif-2', 'user-1', 'achievement', 'Достижение!', 'Вы выполнили 10 задач подряд!'),
      ('notif-3', 'user-1', 'info', 'Новый совет', 'Добавлен новый совет по уходу за питомцем')
    `);

    // Insert sample task logs
    db.run(`INSERT OR IGNORE INTO task_logs (id, taskId, petId, completedAt, notes, duration, quantity, mood) VALUES 
      ('log-1', 'task-1', 'pet-1', '2024-01-15 08:00:00', 'Собака хорошо поела', 15, 1, 'happy'),
      ('log-2', 'task-2', 'pet-1', '2024-01-15 10:30:00', 'Прогулка в парке', 45, 1, 'excited'),
      ('log-3', 'task-3', 'pet-2', '2024-01-15 12:00:00', 'Кошка поела сухой корм', 10, 1, 'calm')
    `);

    // Insert sample pet achievements
    db.run(`INSERT OR IGNORE INTO pet_achievements (id, petId, type, title, description, icon) VALUES 
      ('ach-1', 'pet-1', 'streak', 'Недельная серия', 'Выполнено 7 задач подряд', '🔥'),
      ('ach-2', 'pet-1', 'care', 'Заботливый хозяин', 'Выполнено 50 задач по уходу', '❤️'),
      ('ach-3', 'pet-2', 'activity', 'Активный питомец', 'Завершено 30 игровых сессий', '🎾')
    `);
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
  const { name, type, breed, age, weight, avatar, favoriteToys, allergies, specialNeeds, adoptionDate } = req.body;
  const petId = uuidv4();

  db.run('INSERT INTO pets (id, userId, name, type, breed, age, weight, avatar, favoriteToys, allergies, specialNeeds, adoptionDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [petId, req.user.id, name, type, breed, age, weight, avatar, favoriteToys, allergies, specialNeeds, adoptionDate], function(err) {
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
  const { name, type, breed, age, weight, avatar, favoriteToys, allergies, specialNeeds, adoptionDate } = req.body;

  db.run('UPDATE pets SET name = ?, type = ?, breed = ?, age = ?, weight = ?, avatar = ?, favoriteToys = ?, allergies = ?, specialNeeds = ?, adoptionDate = ? WHERE id = ? AND userId = ?',
    [name, type, breed, age, weight, avatar, favoriteToys, allergies, specialNeeds, adoptionDate, id, req.user.id], function(err) {
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

// Pet photos routes
app.get('/api/pets/:id/photos', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM pet_photos WHERE petId = ? ORDER BY uploadedAt DESC', [id], (err, photos) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(photos);
  });
});

app.post('/api/pets/:id/photos', [
  authenticateToken,
  body('photoUrl').notEmpty().withMessage('Photo URL is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { photoUrl, caption } = req.body;
  const photoId = uuidv4();

  db.run('INSERT INTO pet_photos (id, petId, photoUrl, caption) VALUES (?, ?, ?, ?)',
    [photoId, id, photoUrl, caption], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error uploading photo' });
    }

    db.get('SELECT * FROM pet_photos WHERE id = ?', [photoId], (err, photo) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching uploaded photo' });
      }
      res.status(201).json(photo);
    });
  });
});

// Pet milestones routes
app.get('/api/pets/:id/milestones', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM pet_milestones WHERE petId = ? ORDER BY milestoneDate DESC', [id], (err, milestones) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(milestones);
  });
});

app.post('/api/pets/:id/milestones', [
  authenticateToken,
  body('title').notEmpty().withMessage('Milestone title is required'),
  body('milestoneDate').notEmpty().withMessage('Milestone date is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { title, description, milestoneDate, type } = req.body;
  const milestoneId = uuidv4();

  db.run('INSERT INTO pet_milestones (id, petId, title, description, milestoneDate, type) VALUES (?, ?, ?, ?, ?, ?)',
    [milestoneId, id, title, description, milestoneDate, type], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating milestone' });
    }

    db.get('SELECT * FROM pet_milestones WHERE id = ?', [milestoneId], (err, milestone) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching created milestone' });
      }
      res.status(201).json(milestone);
    });
  });
});

// Pet weight tracking routes
app.get('/api/pets/:id/weight', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM pet_weight_logs WHERE petId = ? ORDER BY measuredAt DESC', [id], (err, weightLogs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(weightLogs);
  });
});

app.post('/api/pets/:id/weight', [
  authenticateToken,
  body('weight').isFloat().withMessage('Valid weight is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { weight, notes } = req.body;
  const logId = uuidv4();

  db.run('INSERT INTO pet_weight_logs (id, petId, weight, notes) VALUES (?, ?, ?, ?)',
    [logId, id, weight, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error logging weight' });
    }

    db.get('SELECT * FROM pet_weight_logs WHERE id = ?', [logId], (err, weightLog) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching weight log' });
      }
      res.status(201).json(weightLog);
    });
  });
});

// Pet mood tracking routes
app.get('/api/pets/:id/mood', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM pet_mood_logs WHERE petId = ? ORDER BY loggedAt DESC', [id], (err, moodLogs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(moodLogs);
  });
});

app.post('/api/pets/:id/mood', [
  authenticateToken,
  body('mood').notEmpty().withMessage('Mood is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { mood, notes } = req.body;
  const logId = uuidv4();

  db.run('INSERT INTO pet_mood_logs (id, petId, mood, notes) VALUES (?, ?, ?, ?)',
    [logId, id, mood, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error logging mood' });
    }

    db.get('SELECT * FROM pet_mood_logs WHERE id = ?', [logId], (err, moodLog) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching mood log' });
      }
      res.status(201).json(moodLog);
    });
  });
});

// Task routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { petId, date, priority, type } = req.query;
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

  if (priority) {
    query += ' AND t.priority = ?';
    params.push(priority);
  }

  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
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
  const { petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, priority } = req.body;
  const taskId = uuidv4();

  // Verify pet belongs to user
  db.get('SELECT id FROM pets WHERE id = ? AND userId = ?', [petId, req.user.id], (err, pet) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    db.run('INSERT INTO tasks (id, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [taskId, petId, title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, priority || 'medium'], function(err) {
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
  const { title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, completedAt, priority } = req.body;

  db.run('UPDATE tasks SET title = ?, description = ?, type = ?, scheduledTime = ?, isRecurring = ?, recurrencePattern = ?, notes = ?, completedAt = ?, priority = ? WHERE id = ?',
    [title, description, type, scheduledTime, isRecurring, recurrencePattern, notes, completedAt, priority, id], function(err) {
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

// Task attachments routes
app.get('/api/tasks/:id/attachments', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM task_attachments WHERE taskId = ? ORDER BY uploadedAt DESC', [id], (err, attachments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(attachments);
  });
});

app.post('/api/tasks/:id/attachments', [
  authenticateToken,
  body('fileUrl').notEmpty().withMessage('File URL is required'),
  body('fileName').notEmpty().withMessage('File name is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { fileUrl, fileName, fileType } = req.body;
  const attachmentId = uuidv4();

  db.run('INSERT INTO task_attachments (id, taskId, fileUrl, fileName, fileType) VALUES (?, ?, ?, ?, ?)',
    [attachmentId, id, fileUrl, fileName, fileType], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error uploading attachment' });
    }

    db.get('SELECT * FROM task_attachments WHERE id = ?', [attachmentId], (err, attachment) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching uploaded attachment' });
      }
      res.status(201).json(attachment);
    });
  });
});

// Task comments routes
app.get('/api/tasks/:id/comments', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT tc.*, u.name as userName FROM task_comments tc JOIN users u ON tc.userId = u.id WHERE tc.taskId = ? ORDER BY tc.createdAt ASC', [id], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(comments);
  });
});

app.post('/api/tasks/:id/comments', [
  authenticateToken,
  body('comment').notEmpty().withMessage('Comment is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const commentId = uuidv4();

  db.run('INSERT INTO task_comments (id, taskId, userId, comment) VALUES (?, ?, ?, ?)',
    [commentId, id, req.user.id, comment], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating comment' });
    }

    db.get('SELECT tc.*, u.name as userName FROM task_comments tc JOIN users u ON tc.userId = u.id WHERE tc.id = ?', [commentId], (err, comment) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching created comment' });
      }
      res.status(201).json(comment);
    });
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

// Notifications routes
app.get('/api/notifications', authenticateToken, (req, res) => {
  const { isRead } = req.query;
  let query = 'SELECT * FROM notifications WHERE userId = ?';
  let params = [req.user.id];

  if (isRead !== undefined) {
    query += ' AND isRead = ?';
    params.push(isRead === 'true' ? 1 : 0);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notifications);
  });
});

app.post('/api/notifications', [
  authenticateToken,
  body('type').notEmpty().withMessage('Notification type is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  handleValidationErrors
], (req, res) => {
  const { type, title, message, relatedId } = req.body;
  const notificationId = uuidv4();

  db.run('INSERT INTO notifications (id, userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?, ?)',
    [notificationId, req.user.id, type, title, message, relatedId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating notification' });
    }

    db.get('SELECT * FROM notifications WHERE id = ?', [notificationId], (err, notification) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching created notification' });
      }
      res.status(201).json(notification);
    });
  });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating notification' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  });
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.run('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating notifications' });
    }

    res.json({ message: 'All notifications marked as read' });
  });
});

// Pet achievements routes
app.get('/api/pets/:id/achievements', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM pet_achievements WHERE petId = ? ORDER BY earnedAt DESC', [id], (err, achievements) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(achievements);
  });
});

app.post('/api/pets/:id/achievements', [
  authenticateToken,
  body('type').notEmpty().withMessage('Achievement type is required'),
  body('title').notEmpty().withMessage('Achievement title is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { type, title, description, icon } = req.body;
  const achievementId = uuidv4();

  db.run('INSERT INTO pet_achievements (id, petId, type, title, description, icon) VALUES (?, ?, ?, ?, ?, ?)',
    [achievementId, id, type, title, description, icon], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating achievement' });
    }

    db.get('SELECT * FROM pet_achievements WHERE id = ?', [achievementId], (err, achievement) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching created achievement' });
      }
      res.status(201).json(achievement);
    });
  });
});

// Shared access routes
app.get('/api/pets/:id/shared', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT sa.*, u.name as userName, u.email as userEmail FROM shared_access sa JOIN users u ON sa.userId = u.id WHERE sa.petId = ?', [id], (err, sharedAccess) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(sharedAccess);
  });
});

app.post('/api/pets/:id/shared', [
  authenticateToken,
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['owner', 'caregiver', 'viewer']).withMessage('Valid role is required'),
  handleValidationErrors
], (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  // Find user by email
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sharedAccessId = uuidv4();

    db.run('INSERT INTO shared_access (id, petId, userId, role) VALUES (?, ?, ?, ?)',
      [sharedAccessId, id, user.id, role], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error sharing pet access' });
      }

      db.get('SELECT sa.*, u.name as userName, u.email as userEmail FROM shared_access sa JOIN users u ON sa.userId = u.id WHERE sa.id = ?', [sharedAccessId], (err, sharedAccess) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching shared access' });
        }
        res.status(201).json(sharedAccess);
      });
    });
  });
});

app.delete('/api/pets/:id/shared/:userId', authenticateToken, (req, res) => {
  const { id, userId } = req.params;

  db.run('DELETE FROM shared_access WHERE petId = ? AND userId = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error removing shared access' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Shared access not found' });
    }

    res.json({ message: 'Shared access removed successfully' });
  });
});

// Pet care tips routes
app.get('/api/pet-care-tips', authenticateToken, (req, res) => {
  const { type, category } = req.query;
  let query = 'SELECT * FROM pet_care_tips WHERE isActive = 1';
  let params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, tips) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tips);
  });
});

// Analytics routes
app.get('/api/analytics/tasks', authenticateToken, (req, res) => {
  const { startDate, endDate, petId } = req.query;
  let query = `
    SELECT 
      t.type,
      COUNT(*) as total,
      SUM(CASE WHEN t.completedAt IS NOT NULL THEN 1 ELSE 0 END) as completed,
      AVG(CASE WHEN t.completedAt IS NOT NULL THEN 1 ELSE 0 END) * 100 as completionRate
    FROM tasks t 
    JOIN pets p ON t.petId = p.id 
    WHERE p.userId = ?
  `;
  let params = [req.user.id];

  if (startDate) {
    query += ' AND DATE(t.scheduledTime) >= DATE(?)';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(t.scheduledTime) <= DATE(?)';
    params.push(endDate);
  }

  if (petId) {
    query += ' AND t.petId = ?';
    params.push(petId);
  }

  query += ' GROUP BY t.type';

  db.all(query, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

app.get('/api/analytics/pets', authenticateToken, (req, res) => {
  const { petId } = req.query;
  let query = `
    SELECT 
      p.id,
      p.name,
      COUNT(t.id) as totalTasks,
      SUM(CASE WHEN t.completedAt IS NOT NULL THEN 1 ELSE 0 END) as completedTasks,
      AVG(CASE WHEN t.completedAt IS NOT NULL THEN 1 ELSE 0 END) * 100 as completionRate
    FROM pets p 
    LEFT JOIN tasks t ON p.id = t.petId 
    WHERE p.userId = ?
  `;
  let params = [req.user.id];

  if (petId) {
    query += ' AND p.id = ?';
    params.push(petId);
  }

  query += ' GROUP BY p.id, p.name';

  db.all(query, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

// User preferences routes
app.get('/api/user/preferences', authenticateToken, (req, res) => {
  db.get('SELECT preferences FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const preferences = user ? JSON.parse(user.preferences || '{}') : {};
    res.json(preferences);
  });
});

app.put('/api/user/preferences', [
  authenticateToken,
  body('preferences').isObject().withMessage('Preferences must be an object'),
  handleValidationErrors
], (req, res) => {
  const { preferences } = req.body;

  db.run('UPDATE users SET preferences = ? WHERE id = ?', [JSON.stringify(preferences), req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating preferences' });
    }

    res.json(preferences);
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});