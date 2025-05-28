// config.ts
// Central place to define your backend’s base URL

import { Platform } from 'react-native';

// If you’re running in the Android emulator, this is router’ed to localhost on your PC
const ANDROID_LOCALHOST = 'http://10.0.2.2:8000';

// Otherwise (iOS simulator or physical device), replace with your PC’s LAN IP
const PC_IP = '192.168.86.247'; // ←— change this to the IPv4 from `ipconfig`

export const API_BASE_URL =
  Platform.OS === 'android'
    ? ANDROID_LOCALHOST
    : `http://${PC_IP}:8000`;

// Debug log—verify in Metro’s console
console.log('[config] API_BASE_URL =', API_BASE_URL);
