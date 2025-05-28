// mobile/src/api/authHeaders.ts
// Helper to grab your stored JWT and build Authorization headers

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getAuthHeaders(): Promise<Record<string,string>> {
  const token = await AsyncStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
