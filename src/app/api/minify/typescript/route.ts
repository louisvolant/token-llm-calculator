// src/app/api/minify/typescript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { transform } from 'sucrase';
import * as Terser from 'terser';
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

    logger.info(
      'Explicit TypeScript minification requested. Transpiling with Sucrase and minifying with Terser...'
    );

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
  } catch (error: unknown) {
    return handleRouteError(error, 'TypeScript minification');
  }
}
