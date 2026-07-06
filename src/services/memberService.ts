import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface MemberProfileResponse {
  id: number;
  user_id: number;
  full_name: string;
  village: string;
  address: string;
  mobile: string;
  is_verified: boolean;
  email?: string;
}

export interface MemberProfileUpdate {
  full_name?: string;
  village?: string;
  address?: string;
  mobile?: string;
}

export interface MemberDashboardStats {
  family_members_count: number;
  pending_inquiries_count: number;
  approved_inquiries_count: number;
  active_notices_count: number;
  upcoming_events_count: number;
}

export interface MemberDashboardSummary {
  profile?: MemberProfileResponse;
  statistics: MemberDashboardStats;
  latest_notice?: any;
  next_event?: any;
  next_booking_inquiry?: any;
}

export interface FamilyMemberResponse {
  id: number;
  profile_id: number;
  name: string;
  relation: string;
  age: number;
  education?: string;
  occupation?: string;
}

export interface FamilyMemberCreate {
  name: string;
  relation: string;
  age: number;
  education?: string;
  occupation?: string;
}

export interface FamilyMemberUpdate {
  name?: string;
  relation?: string;
  age?: number;
  education?: string;
  occupation?: string;
}

export const memberService = {
  getProfile: async (): Promise<MemberProfileResponse> => {
    const response = await apiClient.get<MemberProfileResponse>(API_CONFIG.ENDPOINTS.MEMBERS.ME);
    return response.data;
  },

  updateProfile: async (data: MemberProfileUpdate): Promise<MemberProfileResponse> => {
    const response = await apiClient.put<MemberProfileResponse>(API_CONFIG.ENDPOINTS.MEMBERS.ME, data);
    return response.data;
  },

  getDashboard: async (): Promise<MemberDashboardSummary> => {
    const response = await apiClient.get<MemberDashboardSummary>(API_CONFIG.ENDPOINTS.MEMBERS.DASHBOARD);
    return response.data;
  },

  getFamilyMembers: async (): Promise<FamilyMemberResponse[]> => {
    const response = await apiClient.get<FamilyMemberResponse[]>(API_CONFIG.ENDPOINTS.MEMBERS.FAMILY);
    return response.data;
  },

  createFamilyMember: async (data: FamilyMemberCreate): Promise<FamilyMemberResponse> => {
    const response = await apiClient.post<FamilyMemberResponse>(API_CONFIG.ENDPOINTS.MEMBERS.FAMILY, data);
    return response.data;
  },

  updateFamilyMember: async (id: number, data: FamilyMemberUpdate): Promise<FamilyMemberResponse> => {
    const response = await apiClient.put<FamilyMemberResponse>(`${API_CONFIG.ENDPOINTS.MEMBERS.FAMILY}/${id}`, data);
    return response.data;
  },

  deleteFamilyMember: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.MEMBERS.FAMILY}/${id}`);
  },
};
