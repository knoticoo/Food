const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const requestId = req.headers['x-request-id'] || 'unknown';
    
    logger.logError({
      requestId,
      action: 'validation_failed',
      endpoint: req.path,
      method: req.method,
      errors: errors.array(),
      requestBody: {
        name: req.body.name,
        email: req.body.email,
        passwordLength: req.body.password ? req.body.password.length : 0
      },
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { handleValidationErrors };