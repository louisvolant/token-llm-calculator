// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  timeout: 30000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      if (error.response.status === 404) {
        throw new Error(`Endpoint not found: ${error.config.url}.`);
      }
      throw new Error(error.response.data.error?.message || `HTTP error! Status: ${error.response.status}`);
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