// frontend/src/services/minificationService.ts
import apiClient from './apiClient';

interface MinificationResult {
  minifiedCode: string;
}

/**
 * Minifies code by removing spaces and comments via the backend.
 * @param code The code string to minify.
 * @returns The minified code.
 */
export const minifyCodeRemoveSpacesAndComments = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/remove-spaces-and-comments', { code });
  return response.data;
};

/**
 * Minifies JavaScript code by rewriting variable/method names via the backend.
 * This endpoint intelligently handles JS or TS/TSX.
 * @param code The code string to minify.
 * @returns The minified code.
 */
export const minifyCodeRewriteJavascript = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/rewrite-javascript', { code });
  return response.data;
};

/**
 * Minifies CSS code via the backend.
 * @param code The CSS code string to minify.
 * @returns The minified CSS code.
 */
export const minifyCodeCss = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/css', { code });
  return response.data;
};

/**
 * Minifies TypeScript/TSX code via the backend, explicitly treating it as TSX.
 * @param code The TypeScript/TSX code string to minify.
 * @returns The minified JavaScript code.
 */
export const minifyCodeTypescript = async (code: string): Promise<MinificationResult> => {
  const response = await apiClient.post<MinificationResult>('/api/minify/typescript', { code });
  return response.data;
};