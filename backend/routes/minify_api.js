// routes/minify_api.js
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

// Endpoint for Minify code (remove spaces)
router.post('/minify/remove-spaces', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  const minifiedCode = code.replace(/\s+/g, ''); // Remove all whitespace
  res.json({ minifiedCode });
});

// Endpoint for Minify code (rewrite methods & variables names)
router.post('/minify/rewrite-names', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  // IMPORTANT: This is a placeholder.
  // Real minification by renaming requires a full parser/minifier library (e.g., UglifyJS, Terser, SWC).
  // Implementing this accurately on the backend would involve:
  // 1. Parsing the code into an Abstract Syntax Tree (AST).
  // 2. Traversing the AST to identify and rename variables/functions while avoiding conflicts.
  // 3. Generating minified code from the transformed AST.
  // This is a complex task beyond a simple regex or built-in function.

  const placeholderMinifiedCode = `/* Minification by renaming is complex. Requires a dedicated parser/minifier. */\n${code}`;
  res.json({ minifiedCode: placeholderMinifiedCode });
});

module.exports = router;