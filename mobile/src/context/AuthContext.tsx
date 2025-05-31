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

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_eater: boolean;
  is_feeder: boolean;
  profile_picture: string | null;
  favorites: number[];
  active_role?: string | null;
  address?: string | null;
  id_verification?: string | null;
  chef_id?: number | null; // << Add this!
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = 'token';

  // Load token and user on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          // Fetch user details
          const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (e: any) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  // Log in and fetch user
  async function login(username: string, password: string) {
    setLoading(true);
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

      // Fetch user details after login
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (e: any) {
      Alert.alert('Login Error', e.message);
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  // Log out
  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  // Refresh user details
  async function refreshUser() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
