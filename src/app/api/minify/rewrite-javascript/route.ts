// src/app/api/minify/rewrite-javascript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { isTypeScriptCode } from '@/lib/minify';
import * as swc from '@swc/core';
import * as Terser from 'terser';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: 'Code is required for minification.' },
      { status: 400 }
    );
  }

  try {
    let minifiedCode: string;

    if (isTypeScriptCode(code)) {
      logger.info('Detected TypeScript/TSX code. Transpiling with SWC...');
      const transpiledResult = await swc.transform(
        code,
        {
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
        }
      );

      minifiedCode = transpiledResult.code;
    } else {
      logger.info('Detected plain JavaScript code. Minifying with Terser...');
      const result = await Terser.minify(code, {
        compress: {
          dead_code: true,
          drop_console: true,
        },
        mangle: {
          toplevel: true,
        },
      });

      minifiedCode = result.code || '';
    }

    return NextResponse.json({ minifiedCode });
  } catch (error: any) {
    logger.error('Unexpected error during JS/TS minification process:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during minification.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}