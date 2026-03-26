import axios from 'axios';

// Backend server address - Update this IP to match your backend server
// or use environment variables for different environments
const API_BASE_URL = 'http://172.25.255.27:5001/api';

console.log(`Connecting to API at: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;