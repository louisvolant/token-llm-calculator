// routes/minify_api.js
const express = require('express');
const router = express.Router();
const winston = require('winston');
const Terser = require('terser');
const swc = require('@swc/core');
const CleanCSS = require('clean-css');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Utility function to detect if code is likely TypeScript/TSX
// Keeping it for the /minify/rewrite-javascript endpoint
function isTypeScriptCode(code) {
  const typeAnnotationRegex = /:\s*(?:string|number|boolean|any|null|undefined|Array|Promise|React\.FC|JSX\.Element|\w+\[\]|<.*?>)/;
  const interfaceOrTypeRegex = /(interface|type)\s+\w+\s*\{/;
  const enumRegex = /enum\s+\w+\s*\{/;
  const jsxRegex = /<\w+\s*(\s+\w+=".*?")*\s*\/?\s*>/;

  return (
    typeAnnotationRegex.test(code) ||
    interfaceOrTypeRegex.test(code) ||
    enumRegex.test(code) ||
    jsxRegex.test(code)
  );
}

// Endpoint for Minify code (remove spaces and comments)
router.post('/minify/remove-spaces-and-comments', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  const minifiedCode = code
    .replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*$/g, '')
    .replace(/\s+/g, '');

  res.json({ minifiedCode });
});

// Endpoint for Minify JavaScript (rewrite methods & variables names)
router.post('/minify/rewrite-javascript', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  try {
    let minifiedCode;

    if (isTypeScriptCode(code)) {
      logger.info('Detected TypeScript/TSX code. Transpiling with SWC...');
      const transpiledResult = await swc.transform(code, {
        filename: 'input.tsx',
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          target: 'es5',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
        minify: true,
      });

      if (transpiledResult.errors && transpiledResult.errors.length > 0) {
        logger.error('SWC transpilation errors:', transpiledResult.errors);
        return res.status(400).json({ error: 'Failed to transpile TSX.', details: transpiledResult.errors.map(e => e.message).join(', ') });
      }
      minifiedCode = transpiledResult.code;
    } else {
      logger.info('Detected plain JavaScript code. Minifying with Terser...');
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
    logger.error('Unexpected error during JS/TS minification process:', error);
    res.status(500).json({ error: 'An unexpected error occurred during minification.', details: error.message });
  }
});

// Endpoint for Minify CSS
router.post('/minify/css', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'CSS code is required for minification.' });
  }

  try {
    const output = new CleanCSS().minify(code);

    if (output.errors && output.errors.length > 0) {
      logger.error('Clean-CSS minification errors:', output.errors);
      return res.status(400).json({ error: 'Failed to minify CSS.', details: output.errors.join(', ') });
    }
    if (output.warnings && output.warnings.length > 0) {
      logger.warn('Clean-CSS minification warnings:', output.warnings);
      // You might choose to send warnings to the client or just log them
    }

    res.json({ minifiedCode: output.styles });
  } catch (error) {
    logger.error('Unexpected error during CSS minification:', error);
    res.status(500).json({ error: 'An unexpected error occurred during CSS minification.', details: error.message });
  }
});

// Endpoint for Explicitly Minify TypeScript/TSX
router.post('/minify/typescript', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'TypeScript code is required for minification.' });
  }

  try {
    logger.info('Explicit TypeScript minification requested. Transpiling with SWC...');
    const transpiledResult = await swc.transform(code, {
      filename: 'input.tsx', // Assume TSX for React projects, otherwise 'input.ts'
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true, // Allow TSX syntax
        },
        target: 'es5', // Or your desired target ES version
        transform: {
          react: {
            runtime: 'automatic', // Or 'classic'
          },
        },
      },
      minify: true, // SWC minifies directly
    });

    if (transpiledResult.errors && transpiledResult.errors.length > 0) {
      logger.error('SWC transpilation errors for explicit TSX:', transpiledResult.errors);
      return res.status(400).json({ error: 'Failed to minify explicit TypeScript code.', details: transpiledResult.errors.map(e => e.message).join(', ') });
    }

    res.json({ minifiedCode: transpiledResult.code });
  } catch (error) {
    logger.error('Unexpected error during explicit TypeScript minification:', error);
    res.status(500).json({ error: 'An unexpected error occurred during explicit TypeScript minification.', details: error.message });
  }
});


module.exports = router;