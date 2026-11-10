// src/app/api/minify/remove-spaces-and-comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

    // Step 1: Remove all comments (multi-line and single-line)
    let cleanedCode = code.replace(
      /\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*$/gm,
      ''
    );

    // Step 2: Normalize whitespace
    cleanedCode = cleanedCode
      .replace(/[ \t]+/g, ' ')
      .replace(/(\s*\r?\n\s*){2,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '');

    const lines = cleanedCode.split(/\r?\n/);
    const minifiedLines = lines.map((line: string) => line.trim().replace(/\s+/g, ' '));
    const finalMinifiedCode = minifiedLines
      .filter((line: string) => line.length > 0)
      .join('\n');

    return NextResponse.json({ minifiedCode: finalMinifiedCode });
  } catch (error: unknown) {
    return handleRouteError(error, 'space/comment removal');
  }
}
