// src/app/api/tokenize/hf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Tokenizer } from '@huggingface/tokenizers';
import { isValidHfModelName } from '@/lib/hf';
import {
  handleRouteError,
  HttpError,
  MAX_TEXT_LENGTH,
  readJsonBody,
  requireString,
} from '@/lib/http';

export const runtime = 'nodejs';

const TOKENIZER_FETCH_TIMEOUT_MS = 15_000;

// Cache the promise (not the resolved tokenizer) so concurrent requests for the
// same model share a single download instead of each fetching it again.
const tokenizerCache = new Map<string, Promise<Tokenizer>>();

async function downloadTokenizer(modelName: string): Promise<Tokenizer> {
  const options = { signal: AbortSignal.timeout(TOKENIZER_FETCH_TIMEOUT_MS) };

  try {
    const [jsonRes, configRes] = await Promise.all([
      fetch(`https://huggingface.co/${modelName}/resolve/main/tokenizer.json`, options),
      fetch(`https://huggingface.co/${modelName}/resolve/main/tokenizer_config.json`, options),
    ]);

    if (!jsonRes.ok) {
      throw new HttpError(
        502,
        `Could not load tokenizer for model "${modelName}". Hugging Face returned status ${jsonRes.status}.`
      );
    }

    const tokenizerJSON = await jsonRes.json();
    const tokenizerConfig = configRes.ok ? await configRes.json() : {};

    return new Tokenizer(tokenizerJSON, tokenizerConfig);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new HttpError(
        504,
        `Hugging Face did not respond within ${TOKENIZER_FETCH_TIMEOUT_MS / 1000}s while loading model "${modelName}".`
      );
    }
    throw new HttpError(
      502,
      `Failed to download tokenizer for model "${modelName}".`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

function getTokenizer(modelName: string): Promise<Tokenizer> {
  const cached = tokenizerCache.get(modelName);
  if (cached) {
    return cached;
  }

  const pending = downloadTokenizer(modelName).catch((error) => {
    // Do not cache failures: a temporary Hugging Face outage must not stick.
    tokenizerCache.delete(modelName);
    throw error;
  });

  tokenizerCache.set(modelName, pending);
  return pending;
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const text = requireString(body.text, 'text', MAX_TEXT_LENGTH);
    const modelName = requireString(body.modelName, 'modelName', 200);

    if (!isValidHfModelName(modelName)) {
      throw new HttpError(
        400,
        'modelName must look like "organization/model" (e.g. "Xenova/llama-tokenizer").'
      );
    }

    const tokenizer = await getTokenizer(modelName);
    const { ids } = tokenizer.encode(text);

    return NextResponse.json({ tokenCount: ids.length });
  } catch (error: unknown) {
    return handleRouteError(error, 'Hugging Face tokenization');
  }
}
