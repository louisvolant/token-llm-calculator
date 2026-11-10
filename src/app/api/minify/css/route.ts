// src/app/api/minify/css/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import CleanCSS from 'clean-css';
import {
  handleRouteError,
  MAX_CODE_LENGTH,
  readJsonBody,
  requireString,
} from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const code = requireString(body.code, 'code', MAX_CODE_LENGTH);

    const output = new CleanCSS().minify(code);

    if (output.errors && output.errors.length > 0) {
      logger.error('Clean-CSS minification errors:', output.errors);
      return NextResponse.json(
        {
          error: 'Failed to minify CSS.',
          details: output.errors.join(', '),
        },
        { status: 400 }
      );
    }
    if (output.warnings && output.warnings.length > 0) {
      logger.warn('Clean-CSS minification warnings:', output.warnings);
    }

    return NextResponse.json({ minifiedCode: output.styles });
  } catch (error: unknown) {
    return handleRouteError(error, 'CSS minification');
  }
}
