// frontend/src/services/minificationService.ts
import apiClient from './apiClient';

interface MinificationResult {
  minifiedCode: string;
}

/**
 * Minifies code by removing spaces via the backend.
 * @param code The code string to minify.
 * @returns The minified code.
 */
export const minifyCodeRemoveSpacesAndComments = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/remove-spaces-and-comments', { code });
  return response.data;
};

/**
 * Minifies code by attempting to rewrite variable/method names via the backend.
 * (Note: Backend implementation for this is a placeholder and will not truly rename yet).
 * @param code The code string to minify.
 * @returns The minified code (or placeholder).
 */
export const minifyCodeRewriteJavascript = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/rewrite-javascript', { code });
  return response.data;
};