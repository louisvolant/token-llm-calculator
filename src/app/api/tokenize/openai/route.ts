// src/app/api/tokenize/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { get_encoding } from '@dqbd/tiktoken';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { text, model } = await request.json();

  if (!text) {
    return NextResponse.json(
      { error: 'Text is required for tokenization.' },
      { status: 400 }
    );
  }

  try {
    const encoding = get_encoding(model || 'cl100k_base');
    const tokens = encoding.encode(text);
    return NextResponse.json({ tokenCount: tokens.length });
  } catch (error: any) {
    logger.error('Error in OpenAI tokenization:', error);
    return NextResponse.json(
      { error: `Failed to tokenize text for OpenAI: ${error.message}` },
      { status: 500 }
    );
  }
}