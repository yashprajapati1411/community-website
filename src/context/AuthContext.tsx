import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../services/authService';
import { tokenStorage, apiClient } from '../services/apiClient';

export interface AuthUser {
  id: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT payload safely without adding external dependencies
const decodeJwt = (token: string): { sub: string; role: string; exp: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenStorage.getToken();
      if (storedToken) {
        const decoded = decodeJwt(storedToken);
        const now = Date.now() / 1000;
        if (decoded && decoded.exp > now) {
          setToken(storedToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setUser({ id: decoded.sub, role: decoded.role });
          setIsLoading(false);
          return;
        }
      }

      // Try rotating token silently via HttpOnly cookie if localStorage token is missing or expired
      try {
        const data = await authService.refreshToken();
        setToken(data.access_token);
        tokenStorage.setToken(data.access_token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        const decoded = decodeJwt(data.access_token);
        if (decoded) {
          setUser({ id: decoded.sub, role: decoded.role });
        } else {
          setUser({ id: '1', role: data.role || 'member' });
        }
      } catch {
        tokenStorage.clearToken();
        delete apiClient.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for unauthorized events emitted by apiClient response interceptors
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setToken(data.access_token);
      tokenStorage.setToken(data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      const decoded = decodeJwt(data.access_token);
      if (decoded) {
        setUser({ id: decoded.sub, email: credentials.email, role: decoded.role });
      } else {
        setUser({ id: '1', email: credentials.email, role: data.role || 'member' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      tokenStorage.clearToken();
      delete apiClient.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
