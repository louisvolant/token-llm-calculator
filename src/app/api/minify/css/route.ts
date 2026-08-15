// src/app/api/minify/css/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import CleanCSS from 'clean-css';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: 'CSS code is required for minification.' },
      { status: 400 }
    );
  }

  try {
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
  } catch (error: any) {
    logger.error('Unexpected error during CSS minification:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during CSS minification.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}