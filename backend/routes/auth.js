const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const db = require('../config/database');
const { handleValidationErrors } = require('../middleware/validation');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Register route
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  logger.logRegistration({
    requestId,
    action: 'register_attempt',
    timestamp: new Date().toISOString(),
    requestBody: {
      name: req.body.name,
      email: req.body.email,
      passwordLength: req.body.password ? req.body.password.length : 0
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        logger.logError({
          requestId,
          action: 'database_error',
          error: err.message,
          query: 'SELECT id FROM users WHERE email = ?',
          params: [email],
          duration: Date.now() - startTime
        });
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        logger.logRegistration({
          requestId,
          action: 'registration_failed',
          reason: 'user_already_exists',
          email,
          duration: Date.now() - startTime
        });
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      logger.logDatabase({
        requestId,
        action: 'password_hashed',
        email,
        passwordLength: password.length,
        duration: Date.now() - startTime
      });

      // Create user
      db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', 
        [userId, name, email, hashedPassword], function(err) {
        if (err) {
          logger.logError({
            requestId,
            action: 'user_creation_failed',
            error: err.message,
            email,
            duration: Date.now() - startTime
          });
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate token
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
        
        logger.logRegistration({
          requestId,
          action: 'registration_successful',
          userId,
          email,
          name,
          tokenGenerated: true,
          duration: Date.now() - startTime
        });

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: userId, name, email }
        });
      });
    });
  } catch (error) {
    logger.logError({
      requestId,
      action: 'registration_exception',
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { email, password } = req.body;

  logger.logLogin({
    requestId,
    action: 'login_attempt',
    timestamp: new Date().toISOString(),
    requestBody: {
      email,
      passwordLength: password ? password.length : 0
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      logger.logError({
        requestId,
        action: 'login_database_error',
        error: err.message,
        query: 'SELECT * FROM users WHERE email = ?',
        params: [email],
        duration: Date.now() - startTime
      });
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      logger.logLogin({
        requestId,
        action: 'login_failed',
        reason: 'user_not_found',
        email,
        duration: Date.now() - startTime
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.logLogin({
        requestId,
        action: 'login_failed',
        reason: 'invalid_password',
        email,
        userId: user.id,
        duration: Date.now() - startTime
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    logger.logLogin({
      requestId,
      action: 'login_successful',
      userId: user.id,
      email,
      name: user.name,
      tokenGenerated: true,
      duration: Date.now() - startTime
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    });
  });
});

module.exports = router;