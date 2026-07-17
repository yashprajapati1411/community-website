import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface LoginCredentials {
  mobile?: string;
  email?: string;
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
   * Authenticate user with mobile and password using backend JSON endpoint
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        mobile: credentials.mobile || credentials.email || '',
        password: credentials.password,
      }
    );
    return response.data;
  },

  /**
   * Submit registration request for verification
   */
  register: async (data: { full_name: string; mobile: string; password?: string; confirm_password?: string; email?: string; village?: string }): Promise<any> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Request Forgot Password OTP
   */
  requestForgotPasswordOtp: async (mobile: string): Promise<any> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST_OTP, { mobile });
    return response.data;
  },

  /**
   * Verify Forgot Password OTP
   */
  verifyForgotPasswordOtp: async (mobile: string, otp: string): Promise<any> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY_OTP, { mobile, otp });
    return response.data;
  },

  /**
   * Complete password reset
   */
  resetForgotPassword: async (mobile: string, reset_token: string, new_password: string, confirm_password: string): Promise<any> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, {
      mobile,
      reset_token,
      new_password,
      confirm_password,
    });
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
