import axios from 'axios';

// The Next.js proxy will handle routing this to the backend.
export const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient; 