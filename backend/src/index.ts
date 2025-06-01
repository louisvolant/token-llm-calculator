import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { get_encoding } from '@dqbd/tiktoken';
import { AutoTokenizer } from '@xenova/transformers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// --- Tokenization API Endpoints ---

// Endpoint for OpenAI Token Calculation
app.post('/api/tokenize/openai', (req, res) => {
  const { text, model } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for tokenization.' });
  }

  try {
    // You can validate 'model' here, or just use a default
    // Common models: 'cl100k_base' (for gpt-4, gpt-3.5-turbo), 'p50k_base', 'r50k_base'
    const encoding = get_encoding(model || 'cl100k_base');
    const tokens = encoding.encode(text);
    res.json({ tokenCount: tokens.length });
  } catch (error: any) {
    console.error('Error in OpenAI tokenization:', error);
    res.status(500).json({ error: `Failed to tokenize text for OpenAI: ${error.message}` });
  }
});

// Endpoint for Hugging Face Token Calculation
app.post('/api/tokenize/hf', async (req, res) => {
  const { text, modelName } = req.body; // modelName could be 'Xenova/llama-tokenizer' etc.

  if (!text || !modelName) {
    return res.status(400).json({ error: 'Text and modelName are required for HF tokenization.' });
  }

  try {
    // Load tokenizer - this can be slow and memory-intensive if not cached.
    // For production, consider pre-loading or using a caching mechanism.
    const tokenizer = await AutoTokenizer.from_pretrained(modelName);
    const { input_ids } = await tokenizer(text);
    res.json({ tokenCount: input_ids.data.length }); // input_ids.data is a TypedArray
  } catch (error: any) {
    console.error('Error in Hugging Face tokenization:', error);
    res.status(500).json({ error: `Failed to tokenize text for Hugging Face: ${error.message}` });
  }
});

// --- Minification API Endpoints ---

// Endpoint for Minify code (remove spaces)
app.post('/api/minify/remove-spaces', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  const minifiedCode = code.replace(/\s+/g, ''); // Remove all whitespace
  res.json({ minifiedCode });
});

// Endpoint for Minify code (rewrite methods & variables names)
app.post('/api/minify/rewrite-names', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for minification.' });
  }

  // --- IMPORTANT: This is a placeholder ---
  // Real minification by renaming requires a full parser/minifier library (e.g., UglifyJS, Terser, SWC)
  // Implementing this accurately on the backend would involve:
  // 1. Parsing the code into an Abstract Syntax Tree (AST).
  // 2. Traversing the AST to identify and rename variables/functions while avoiding conflicts.
  // 3. Generating minified code from the transformed AST.
  // This is a complex task beyond a simple regex or built-in function.

  const placeholderMinifiedCode = `/* Minification by renaming is complex. Requires a dedicated parser/minifier. */\n${code}`;
  res.json({ minifiedCode: placeholderMinifiedCode });
});


app.get('/', (req, res) => {
  res.send('LLM Calculator Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});