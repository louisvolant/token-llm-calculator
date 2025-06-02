// routes/minify_api.js
const express = require('express');
const router = express.Router();
const winston = require('winston');
const Terser = require('terser');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Endpoint for Minify code (remove spaces and comments)
router.post('/minify/remove-spaces-and-comments', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  // Remove all whitespace and comments
  // This is a basic approach and might not catch all comment types or edge cases perfectly.
  // For robust comment removal, a proper parser is better, but for just spaces/comments, this is a start.
  const minifiedCode = code
    .replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*$/g, '') // Remove multi-line and single-line comments
    .replace(/\s+/g, ''); // Remove all whitespace

  res.json({ minifiedCode });
});

// Endpoint for Minify code (rewrite methods & variables names using Terser)
router.post('/minify/rewrite-javascript', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  try {
    const result = await Terser.minify(code, {
      // Terser options
      compress: {
        dead_code: true, // Remove unreachable code
        drop_console: true, // Remove console.log statements
      },
      mangle: {
        toplevel: true, // Mangle top-level variable names
      },
    });

    if (result.error) {
      logger.error('Terser minification error:', result.error);
      return res.status(500).json({ error: 'Failed to minify code.', details: result.error.message });
    }

    res.json({ minifiedCode: result.code });
  } catch (error) {
    logger.error('Unexpected error during Terser minification:', error);
    res.status(500).json({ error: 'An unexpected error occurred during minification.' });
  }
});

module.exports = router;