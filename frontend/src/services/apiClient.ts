// frontend/src/services/apiClient.ts
import axios from 'axios';

console.log('BACKEND_URL:', process.env.NEXT_PUBLIC_API_URL);

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Optional: Add an interceptor to handle common error responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    // You can centralize error handling here, e.g., for 401 Unauthorized
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      throw new Error(error.response.data.error || `HTTP error! Status: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
);

export default apiClient;