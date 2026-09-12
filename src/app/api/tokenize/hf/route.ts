// src/app/api/tokenize/hf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Tokenizer } from '@huggingface/tokenizers';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// Cache loaded tokenizers in memory to prevent repeated network requests
const tokenizerCache = new Map<string, Tokenizer>();

async function getTokenizer(modelName: string): Promise<Tokenizer> {
  const cached = tokenizerCache.get(modelName);
  if (cached) {
    return cached;
  }

  const [jsonRes, configRes] = await Promise.all([
    fetch(`https://huggingface.co/${modelName}/resolve/main/tokenizer.json`),
    fetch(`https://huggingface.co/${modelName}/resolve/main/tokenizer_config.json`),
  ]);

  if (!jsonRes.ok) {
    throw new Error(
      `Could not load tokenizer for model "${modelName}". HF Hub returned status ${jsonRes.status}`
    );
  }

  const tokenizerJSON = await jsonRes.json();
  const tokenizerConfig = configRes.ok ? await configRes.json() : {};

  const tokenizer = new Tokenizer(tokenizerJSON, tokenizerConfig);
  tokenizerCache.set(modelName, tokenizer);
  return tokenizer;
}

export async function POST(request: NextRequest) {
  try {
    const { text, modelName } = await request.json();

    if (!text || !modelName) {
      return NextResponse.json(
        { error: 'Text and modelName are required for HF tokenization.' },
        { status: 400 }
      );
    }

    const tokenizer = await getTokenizer(modelName);
    const { ids } = tokenizer.encode(text);
    return NextResponse.json({ tokenCount: ids.length });
  } catch (error: any) {
    logger.error('Error in Hugging Face tokenization:', error);
    return NextResponse.json(
      { error: `Failed to tokenize text for Hugging Face: ${error.message}` },
      { status: 500 }
    );
  }
}