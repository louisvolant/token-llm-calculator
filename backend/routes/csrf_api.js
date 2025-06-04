// backend/routes/csrf_api.js
const express = require('express');
const router = express.Router();
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Middleware to skip CSRF token validation for this route
const skipCsrfValidation = (req, res, next) => {
  // Since csurf is applied globally, we bypass token validation for this route
  next();
};

// Endpoint to get CSRF token for the frontend
router.get('/csrf-token', skipCsrfValidation, (req, res) => {
  try {
    const token = req.csrfToken();
    logger.info('CSRF token generated successfully');
    res.json({ csrfToken: token });
  } catch (error) {
    logger.error('Error generating CSRF token:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

console.log('CSRF API route registered');

module.exports = router;