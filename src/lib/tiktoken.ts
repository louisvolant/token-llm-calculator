import {
  getEncodingNameForModel,
  type TiktokenEncoding,
  type TiktokenModel,
} from 'js-tiktoken';

const ENCODINGS = new Set<TiktokenEncoding>([
  'gpt2',
  'r50k_base',
  'p50k_base',
  'p50k_edit',
  'cl100k_base',
  'o200k_base',
]);

/**
 * Accepts either an encoding name (`cl100k_base`) or a model name (`gpt-4o`).
 * Unknown values fall back to `cl100k_base` so a bad parameter never crashes
 * the handler.
 */
export function resolveEncoding(requested: string): TiktokenEncoding {
  if (ENCODINGS.has(requested as TiktokenEncoding)) {
    return requested as TiktokenEncoding;
  }
  try {
    return getEncodingNameForModel(requested as TiktokenModel);
  } catch {
    return 'cl100k_base';
  }
}
