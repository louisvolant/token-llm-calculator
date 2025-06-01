//routes/tokenize_api.js
const express = require('express');
const router = express.Router();
const winston = require('winston');

// Import @dqbd/tiktoken using CommonJS require() as it's likely still CommonJS
const { get_encoding } = require('@dqbd/tiktoken');

// For @xenova/transformers, use dynamic import() because it's an ES Module
// We'll load it once and then use the destructured AutoTokenizer
let AutoTokenizer;

async function initializeTokenizer() {
  if (!AutoTokenizer) {
    const transformers = await import('@xenova/transformers');
    AutoTokenizer = transformers.AutoTokenizer;
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Endpoint for OpenAI Token Calculation
router.post('/tokenize/openai', (req, res) => {
  const { text, model } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for tokenization.' });
  }

  try {
    const encoding = get_encoding(model || 'cl100k_base');
    const tokens = encoding.encode(text);
    res.json({ tokenCount: tokens.length });
  } catch (error) {
    logger.error('Error in OpenAI tokenization:', error);
    res.status(500).json({ error: `Failed to tokenize text for OpenAI: ${error.message}` });
  }
});

// Endpoint for Hugging Face Token Calculation
router.post('/tokenize/hf', async (req, res) => {
  const { text, modelName } = req.body;

  if (!text || !modelName) {
    return res.status(400).json({ error: 'Text and modelName are required for HF tokenization.' });
  }

  try {
    // Ensure the tokenizer is loaded before proceeding
    await initializeTokenizer();

    // Load tokenizer - this can be slow and memory-intensive if not cached.
    // For production, consider pre-loading or using a caching mechanism.
    const tokenizer = await AutoTokenizer.from_pretrained(modelName);
    const { input_ids } = await tokenizer(text);
    res.json({ tokenCount: input_ids.data.length }); // input_ids.data is a TypedArray
  } catch (error) {
    logger.error('Error in Hugging Face tokenization:', error);
    res.status(500).json({ error: `Failed to tokenize text for Hugging Face: ${error.message}` });
  }
});

module.exports = router;