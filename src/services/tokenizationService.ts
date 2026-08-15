// frontend/src/services/tokenizationService.ts
import apiClient from './apiClient';

interface TokenizationResult {
  tokenCount: number;
}

/**
 * Calculates OpenAI token count via the backend.
 * @param text The text to tokenize.
 * @param model The OpenAI encoding model (e.g., 'cl100k_base').
 * @returns The token count.
 */
export const calculateOpenAITokens = async (text: string, model: string = 'cl100k_base'): Promise<TokenizationResult> => {
  const response = await apiClient.post<TokenizationResult>('/api/tokenize/openai', { text, model });
  return response.data;
};

/**
 * Calculates Hugging Face token count via the backend.
 * @param text The text to tokenize.
 * @param modelName The Hugging Face model tokenizer name (e.g., 'Xenova/llama-tokenizer').
 * @returns The token count.
 */
export const calculateHFTokens = async (text: string, modelName: string): Promise<TokenizationResult> => {
  const response = await apiClient.post<TokenizationResult>('/api/tokenize/hf', { text, modelName });
  return response.data;
};