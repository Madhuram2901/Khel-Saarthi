import axios from 'axios';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
  const ip = hostUri.split(':')[0];
  return `http://${ip}:5001/api`;
};

const API_URL = getApiUrl();

console.log(`Connecting to API at: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;