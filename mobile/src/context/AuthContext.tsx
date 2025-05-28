// mobile/src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../api/config';

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const TOKEN_KEY = 'token';

  // On mount: load stored token and validate it
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          // Probe /users/me to check validity
          const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.ok) {
            setToken(stored);
          } else {
            // Invalid or expired
            await AsyncStorage.removeItem(TOKEN_KEY);
            setToken(null);
          }
        }
      } catch (e: any) {
        console.warn('AuthProvider init error', e);
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    })();
  }, []);

  // Log in and persist token
  async function login(username: string, password: string) {
    try {
      const resp = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed');
      }
      const data = await resp.json();
      await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
    } catch (e: any) {
      Alert.alert('Login Error', e.message);
      throw e;
    }
  }

  // Log out and clear token
  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
