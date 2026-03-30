import Constants from 'expo-constants';

const EXPO_EXTRA = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const DEV_MACHINE_IP = EXPO_EXTRA.devMachineIp || '172.25.234.85';
export const API_PORT = EXPO_EXTRA.apiPort || '5001';
export const SOCKET_PORT = EXPO_EXTRA.socketPort || API_PORT;
export const API_BASE_URL = EXPO_EXTRA.apiBaseUrl || `http://${DEV_MACHINE_IP}:${API_PORT}/api`;
export const SOCKET_SERVER_URL = EXPO_EXTRA.socketServerUrl || `http://${DEV_MACHINE_IP}:${SOCKET_PORT}`;

