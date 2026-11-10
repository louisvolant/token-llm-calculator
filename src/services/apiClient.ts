// src/services/apiClient.ts
import axios from 'axios';
import { extractErrorMessage } from '@/lib/apiError';

const apiClient = axios.create({
  timeout: 30000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error('API Error:', data);
      console.error('Status:', status);

      if (status === 404) {
        throw new Error(`Endpoint not found: ${error.config?.url ?? 'unknown'}.`);
      }

      throw new Error(extractErrorMessage(data, status));
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      console.error('Request Error:', error.message);
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
);

export default apiClient;
