/**
 * The API returns `{ error: string, details?: string }` but some libraries
 * return `{ error: { message: string } }`. Handle both shapes so the UI never
 * displays "[object Object]" or a generic status message.
 */
export function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const payload = data as { error?: unknown; details?: unknown };

    if (typeof payload.error === 'string' && payload.error) {
      return typeof payload.details === 'string' && payload.details
        ? `${payload.error} (${payload.details})`
        : payload.error;
    }

    if (
      payload.error &&
      typeof payload.error === 'object' &&
      'message' in payload.error &&
      typeof (payload.error as { message?: unknown }).message === 'string'
    ) {
      return (payload.error as { message: string }).message;
    }
  }

  return `HTTP error! Status: ${status}`;
}
