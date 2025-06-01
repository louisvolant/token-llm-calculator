// frontend/src/services/apiClient.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions extends RequestInit {
  body?: any; // Allow any type for body, will be JSON.stringified
}

export async function apiClient<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  options?: RequestOptions
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    ...options,
  };

  if (options?.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      // If the response is not JSON, use the status text
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
    }
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  // Handle cases where response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return null as T; // Or handle specifically
  }

  return response.json() as Promise<T>;
}