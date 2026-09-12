// src/app/api/minify/typescript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { transform } from 'sucrase';
import * as Terser from 'terser';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: 'TypeScript code is required for minification.' },
      { status: 400 }
    );
  }

  try {
    logger.info('Explicit TypeScript minification requested. Transpiling with Sucrase and minifying with Terser...');
    const transpiled = transform(code, {
      transforms: ['typescript', 'jsx'],
    }).code;

    const result = await Terser.minify(transpiled, {
      compress: {
        dead_code: true,
        drop_console: true,
      },
      mangle: {
        toplevel: true,
      },
    });

    return NextResponse.json({ minifiedCode: result.code || '' });
  } catch (error: any) {
    logger.error('Unexpected error during explicit TypeScript minification:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during explicit TypeScript minification.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}