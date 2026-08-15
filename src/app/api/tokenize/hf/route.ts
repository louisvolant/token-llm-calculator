// src/app/api/tokenize/hf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

let AutoTokenizer: any;

async function initializeTokenizer() {
  if (!AutoTokenizer) {
    const transformers = await import('@xenova/transformers');
    AutoTokenizer = transformers.AutoTokenizer;
  }
}

export async function POST(request: NextRequest) {
  const { text, modelName } = await request.json();

  if (!text || !modelName) {
    return NextResponse.json(
      { error: 'Text and modelName are required for HF tokenization.' },
      { status: 400 }
    );
  }

  try {
    await initializeTokenizer();
    const tokenizer = await AutoTokenizer.from_pretrained(modelName);
    const { input_ids } = await tokenizer(text);
    return NextResponse.json({ tokenCount: input_ids.data.length });
  } catch (error: any) {
    logger.error('Error in Hugging Face tokenization:', error);
    return NextResponse.json(
      { error: `Failed to tokenize text for Hugging Face: ${error.message}` },
      { status: 500 }
    );
  }
}