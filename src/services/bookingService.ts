import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface BookingAvailabilityResponse {
  available: boolean;
}

export interface BookingInquiryCreate {
  contact_name: string;
  contact_phone: string;
  booking_date: string;
  purpose: string;
  hall: string;
  event_name: string;
  member_count: number;
}

export interface BookingInquiryResponse {
  id: number;
  profile_id?: number;
  contact_name: string;
  contact_phone: string;
  booking_date: string;
  status: 'pending' | 'approved' | 'rejected';
  purpose: string;
  hall: string;
  event_name: string;
  booking_type: string;
  member_count: number;
  admin_remark?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingHistoryQueryParams {
  status?: string;
  sort_by?: string;
  order?: string;
  skip?: number;
  limit?: number;
}

export const bookingService = {
  checkAvailability: async (date: string, hall: string): Promise<boolean> => {
    const response = await apiClient.get<BookingAvailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.AVAILABILITY}?date=${encodeURIComponent(date)}&hall=${encodeURIComponent(hall)}`
    );
    return response.data.available;
  },

  submitInquiry: async (data: BookingInquiryCreate): Promise<BookingInquiryResponse> => {
    const response = await apiClient.post<BookingInquiryResponse>(
      API_CONFIG.ENDPOINTS.BOOKINGS.INQUIRY,
      data
    );
    return response.data;
  },

  getHistory: async (params?: BookingHistoryQueryParams): Promise<BookingInquiryResponse[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.order) query.append('order', params.order);
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const url = `${API_CONFIG.ENDPOINTS.BOOKINGS.HISTORY}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<BookingInquiryResponse[]>(url);
    return response.data;
  },
};
