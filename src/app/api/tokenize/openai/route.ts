// src/app/api/tokenize/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEncoding } from 'js-tiktoken';
import { resolveEncoding } from '@/lib/tiktoken';
import {
  handleRouteError,
  MAX_TEXT_LENGTH,
  readJsonBody,
  requireString,
} from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const text = requireString(body.text, 'text', MAX_TEXT_LENGTH);
    const model =
      typeof body.model === 'string' && body.model.length > 0
        ? body.model
        : 'cl100k_base';

    const encoding = getEncoding(resolveEncoding(model));
    const tokens = encoding.encode(text);

    return NextResponse.json({ tokenCount: tokens.length });
  } catch (error: unknown) {
    return handleRouteError(error, 'OpenAI tokenization');
  }
}
