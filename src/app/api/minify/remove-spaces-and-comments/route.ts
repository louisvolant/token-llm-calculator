// src/app/api/minify/remove-spaces-and-comments/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: 'Code is required for minification.' },
      { status: 400 }
    );
  }

  // Step 1: Remove all comments (multi-line and single-line)
  let cleanedCode = code.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*$/gm, ''); // `gm` for multiline and global

  // Step 2: Normalize whitespace
  cleanedCode = cleanedCode
    .replace(/[ \t]+/g, ' ')
    .replace(/(\s*\r?\n\s*){2,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  const lines = cleanedCode.split(/\r?\n/);
  const minifiedLines = lines.map((line: string) =>
    line.trim()
        .replace(/\s+/g, ' ')
  );
  const finalMinifiedCode = minifiedLines.filter((line: string) => line.length > 0).join('\n');

  return NextResponse.json({ minifiedCode: finalMinifiedCode });
}