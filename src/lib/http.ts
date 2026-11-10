// src/lib/http.ts
/**
 * Maximum number of characters accepted for a tokenization request.
 */
export const MAX_TEXT_LENGTH = 500_000;

/**
 * Maximum number of characters accepted for a minification request.
 */
export const MAX_CODE_LENGTH = 200_000;

/**
 * Hard limit on the raw JSON body. This is intentionally larger than the
 * per-field limits because JSON escaping can inflate the payload.
 */
const MAX_BODY_BYTES = 4 * 1024 * 1024;

/**
 * Error carrying an HTTP status code. Thrown by the helpers below so route
 * handlers can turn expected failures (empty body, invalid JSON, input too
 * large...) into proper 4xx responses instead of uncaught exceptions.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Reads and parses a JSON request body.
 *
 * `request.json()` throws on an empty or malformed body, and also rejects when
 * the client aborts the upload. In a Worker that surfaces as an
 * "Uncaught Exception (1101)", so every route must go through this helper.
 */
export async function readJsonBody(
  request: Request
): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new HttpError(
      413,
      `Request body is too large. Maximum size is ${MAX_BODY_BYTES} bytes.`
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    // Happens when the client disconnects while the body is being uploaded.
    throw new HttpError(
      400,
      'The request body could not be read (client aborted or connection interrupted).'
    );
  }

  if (raw.length > MAX_BODY_BYTES) {
    throw new HttpError(
      413,
      `Request body is too large. Maximum size is ${MAX_BODY_BYTES} bytes.`
    );
  }

  if (raw.trim() === '') {
    throw new HttpError(400, 'Request body is empty. Expected a JSON object.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  return parsed as Record<string, unknown>;
}

/**
 * Validates that a field is a non-empty string and enforces a maximum length.
 */
export function requireString(
  value: unknown,
  field: string,
  maxLength: number
): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpError(400, `${field} is required and must be a non-empty string.`);
  }
  if (value.length > maxLength) {
    throw new HttpError(
      413,
      `${field} is too long (${value.length} characters, maximum is ${maxLength}).`
    );
  }
  return value;
}

/**
 * Converts a thrown value into a JSON response. Known `HttpError`s keep their
 * status/message; anything else is logged and returned as a 500.
 *
 * Returns a plain Web `Response` so this module stays framework-agnostic and
 * can be unit tested without the Next.js runtime.
 */
export function handleRouteError(error: unknown, context: string): Response {
  if (error instanceof HttpError) {
    return Response.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unhandled error in ${context}:`, { message });

  return Response.json(
    {
      error: `An unexpected error occurred during ${context}.`,
      details: message,
    },
    { status: 500 }
  );
}
