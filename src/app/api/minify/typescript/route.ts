// src/app/api/minify/typescript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import * as swc from '@swc/core';

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
    logger.info('Explicit TypeScript minification requested. Transpiling with SWC...');
    const transpiledResult = await swc.transform(code, {
      filename: 'input.tsx',
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        target: 'es5',
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
      minify: true,
    });

    return NextResponse.json({ minifiedCode: transpiledResult.code });
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