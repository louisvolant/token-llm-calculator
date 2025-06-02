// routes/minify_api.js
const express = require('express');
const router = express.Router();
const winston = require('winston');
const Terser = require('terser');
const swc = require('@swc/core');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Utility function to detect if code is likely TypeScript/TSX
function isTypeScriptCode(code) {
  // Regex to check for common TypeScript/TSX specific syntax
  // - Type annotations (e.g., variable: type, function(param: type))
  // - Interface/Type declarations (interface, type MyType = ...)
  // - JSX syntax (starts with < and ends with > in a component-like context)
  //   Note: This can be tricky. A simpler check might be just for angle brackets
  //   that aren't part of comparisons.
  const typeAnnotationRegex = /:\s*(?:string|number|boolean|any|null|undefined|Array|Promise|React\.FC|JSX\.Element|\w+\[\]|<.*?>)/;
  const interfaceOrTypeRegex = /(interface|type)\s+\w+\s*\{/;
  const enumRegex = /enum\s+\w+\s*\{/;
  const jsxRegex = /<\w+\s*(\s+\w+=".*?")*\s*\/?\s*>/; // Basic JSX tag detection

  return (
    typeAnnotationRegex.test(code) ||
    interfaceOrTypeRegex.test(code) ||
    enumRegex.test(code) ||
    jsxRegex.test(code)
    // You can add more checks here as needed
  );
}

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
    .replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*$/g, '')
    .replace(/\s+/g, '');

  res.json({ minifiedCode });
});

// Endpoint for Minify code (rewrite methods & variables names using Terser)
router.post('/minify/rewrite-javascript', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  try {
    let minifiedCode;

    if (isTypeScriptCode(code)) {
      logger.info('Detected TypeScript/TSX code. Transpiling with SWC...');
      // Transpile TSX to JavaScript using SWC
      const transpiledResult = await swc.transform(code, {
        filename: 'input.tsx', // Crucial for SWC to know it's TSX
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          target: 'es5', // Or your desired target
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
        minify: true, // SWC minifies directly
      });

      if (transpiledResult.errors && transpiledResult.errors.length > 0) {
        logger.error('SWC transpilation errors:', transpiledResult.errors);
        return res.status(400).json({ error: 'Failed to transpile TSX.', details: transpiledResult.errors.map(e => e.message).join(', ') });
      }
      minifiedCode = transpiledResult.code;
    } else {
      logger.info('Detected plain JavaScript code. Minifying with Terser...');
      // Minify plain JavaScript using Terser
      const result = await Terser.minify(code, {
        compress: {
          dead_code: true,
          drop_console: true,
        },
        mangle: {
          toplevel: true,
        },
      });

      if (result.error) {
        logger.error('Terser minification error:', result.error);
        return res.status(500).json({ error: 'Failed to minify code.', details: result.error.message });
      }
      minifiedCode = result.code;
    }

    res.json({ minifiedCode });
  } catch (error) {
    logger.error('Unexpected error during minification process:', error);
    res.status(500).json({ error: 'An unexpected error occurred during minification.', details: error.message });
  }
});

module.exports = router;