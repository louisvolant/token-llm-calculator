// src/app/api/minify/rewrite-javascript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { isTypeScriptCode } from '@/lib/minify';
import { transform } from 'sucrase';
import * as Terser from 'terser';
import {
  handleRouteError,
  MAX_CODE_LENGTH,
  readJsonBody,
  requireString,
} from '@/lib/http';

export const runtime = 'nodejs';

const terserOptions: Terser.MinifyOptions = {
  compress: {
    dead_code: true,
    drop_console: true,
  },
  mangle: {
    toplevel: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const code = requireString(body.code, 'code', MAX_CODE_LENGTH);

    let minifiedCode: string;

    if (isTypeScriptCode(code)) {
      logger.info(
        'Detected TypeScript/TSX code. Transpiling with Sucrase and minifying with Terser...'
      );
      const transpiled = transform(code, {
        transforms: ['typescript', 'jsx'],
      }).code;

      const result = await Terser.minify(transpiled, terserOptions);
      minifiedCode = result.code || '';
    } else {
      logger.info('Detected plain JavaScript code. Minifying with Terser...');
      const result = await Terser.minify(code, terserOptions);
      minifiedCode = result.code || '';
    }

    return NextResponse.json({ minifiedCode });
  } catch (error: unknown) {
    return handleRouteError(error, 'JS/TS minification');
  }
}
