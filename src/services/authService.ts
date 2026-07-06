import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role?: string;
}

export interface MemberProfileData {
  id: number;
  user_id: number;
  full_name: string;
  village: string;
  city: string;
  is_verified: boolean;
  phone?: string;
  occupation?: string;
  address?: string;
}

export const authService = {
  /**
   * Authenticate user with email and password using backend JSON endpoint
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        email: credentials.email,
        password: credentials.password,
      }
    );
    return response.data;
  },

  /**
   * Refresh JWT access token using HttpOnly cookie
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      {}
    );
    return response.data;
  },

  /**
   * Revoke refresh token and log out
   */
  logout: async (): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
  },

  /**
   * Get current user profile data
   */
  getCurrentUserProfile: async (): Promise<MemberProfileData> => {
    const response = await apiClient.get<MemberProfileData>(
      API_CONFIG.ENDPOINTS.MEMBERS.ME
    );
    return response.data;
  },
};
