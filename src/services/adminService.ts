import { apiClient } from './apiClient';

// ─── Admin Endpoint Paths ─────────────────────────────────────────────────
const BASE = '/admin';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AdminDashboardSummary {
  total_members_count: number;
  verified_members_count: number;
  pending_bookings_count: number;
  upcoming_events_count: number;
  active_notices_count: number;
  gallery_images_count: number;
  committee_members_count: number;
  pending_registrations_count?: number;
  approved_members_count?: number;
  rejected_registrations_count?: number;
}

export interface RegistrationRequestResponse {
  id: number;
  user_id: number;
  full_name: string;
  mobile: string;
  status: string;
  reviewed_at?: string;
  reviewed_by?: number;
  remarks?: string;
  created_at: string;
}

export interface AdminMemberResponse {
  id: number;
  full_name: string;
  mobile: string;
  email?: string;
  village: string;
  address: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminBookingResponse {
  id: number;
  profile_id: number;
  contact_name: string;
  contact_phone: string;
  booking_date: string;
  status: string;
  purpose: string;
  hall: string;
  event_name?: string;
  booking_type: string;
  member_count: number;
  amount: string;
  payment_status: string;
  admin_remark?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingReviewRequest {
  status: 'approved' | 'rejected';
  amount?: number;
  payment_status?: 'pending' | 'paid' | 'refunded';
  admin_remark?: string;
}

export interface AdminCommitteeMemberResponse {
  id: number;
  name: string;
  designation: string;
  phone?: string;
  email?: string;
  term_start: string;
  term_end?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommitteeMemberCreateRequest {
  name: string;
  designation: string;
  phone?: string;
  email?: string;
  term_start: string;
  term_end?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface AdminEventResponse {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  status: string;
  cover_image?: string;
  is_featured: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  form_fields?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EventCreateRequest {
  title: string;
  description: string;
  event_date: string;
  location: string;
  status: string;
  cover_image?: string;
  is_featured: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  form_fields?: string[];
}

export interface AdminNoticeResponse {
  id: number;
  title: string;
  description: string;
  priority: string;
  publish_date: string;
  expiry_date?: string;
  attachment?: string;
  show_on_homepage: boolean;
  is_pinned: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NoticeCreateRequest {
  title: string;
  description: string;
  priority: string;
  publish_date: string;
  expiry_date?: string;
  attachment?: string;
  show_on_homepage: boolean;
  is_pinned: boolean;
  is_active: boolean;
}

export interface AdminGalleryAlbumResponse {
  id: number;
  title: string;
  description?: string;
  cover_image?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbumCreateRequest {
  title: string;
  description?: string;
  cover_image?: string;
  display_order: number;
}

export interface AdminAnnualReportResponse {
  id: number;
  title: string;
  description?: string;
  financial_year: string;
  file_url: string;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualReportCreateRequest {
  title: string;
  description?: string;
  financial_year: string;
  file_url: string;
  display_order: number;
  is_published: boolean;
}

export interface AdminEventRegistrationResponse {
  id: number;
  event_id: number;
  user_id?: number;
  name: string;
  mobile?: string;
  email?: string;
  member_count: number;
  remarks?: string;
  status: string;
  created_at?: string;
}

export interface AdminEventRegistrationsSummaryResponse {
  total_registrations: number;
  total_expected_attendees: number;
  registrations: AdminEventRegistrationResponse[];
}


export interface AdminGalleryImageResponse {
  id: number;
  album_id: number;
  caption?: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryImageCreateRequest {
  caption?: string;
  image_url: string;
}

export interface AdminSurnameHistoryResponse {
  id: number;
  surname: string;
  native_region: string;
  history: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurnameHistoryCreateRequest {
  surname: string;
  native_region: string;
  history: string;
  description?: string;
}

// ─── Admin Service ─────────────────────────────────────────────────────────

export const adminService = {
  // Role Verification
  verifyRole: async (): Promise<{ verified: boolean; role: string }> => {
    const res = await apiClient.get(`${BASE}/auth/verify-role`);
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async (): Promise<AdminDashboardSummary> => {
    const res = await apiClient.get(`${BASE}/dashboard/summary`);
    return res.data;
  },

  // Members
  getMembers: async (verified?: boolean): Promise<AdminMemberResponse[]> => {
    const params = verified !== undefined ? { verified } : {};
    const res = await apiClient.get(`${BASE}/members`, { params });
    return res.data;
  },
  toggleMemberVerification: async (id: number, is_verified: boolean): Promise<AdminMemberResponse> => {
    const res = await apiClient.post(`${BASE}/members/${id}/verify`, null, { params: { is_verified } });
    return res.data;
  },
  deleteMember: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/members/${id}`);
  },

  // Bookings
  getBookings: async (): Promise<AdminBookingResponse[]> => {
    const res = await apiClient.get(`${BASE}/bookings/history`);
    return res.data;
  },
  reviewBooking: async (id: number, data: BookingReviewRequest): Promise<AdminBookingResponse> => {
    const res = await apiClient.put(`${BASE}/bookings/${id}/review`, data);
    return res.data;
  },
  deleteBooking: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/bookings/${id}`);
  },

  // Committee
  getCommittee: async (): Promise<AdminCommitteeMemberResponse[]> => {
    const res = await apiClient.get(`${BASE}/committee`);
    return res.data;
  },
  createCommitteeMember: async (data: CommitteeMemberCreateRequest): Promise<AdminCommitteeMemberResponse> => {
    const res = await apiClient.post(`${BASE}/committee`, data);
    return res.data;
  },
  updateCommitteeMember: async (id: number, data: Partial<CommitteeMemberCreateRequest>): Promise<AdminCommitteeMemberResponse> => {
    const res = await apiClient.put(`${BASE}/committee/${id}`, data);
    return res.data;
  },
  deleteCommitteeMember: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/committee/${id}`);
  },

  // Events
  getEvents: async (): Promise<AdminEventResponse[]> => {
    const res = await apiClient.get(`${BASE}/events`);
    return res.data;
  },
  createEvent: async (data: EventCreateRequest): Promise<AdminEventResponse> => {
    const res = await apiClient.post(`${BASE}/events`, data);
    return res.data;
  },
  updateEvent: async (id: number, data: Partial<EventCreateRequest>): Promise<AdminEventResponse> => {
    const res = await apiClient.put(`${BASE}/events/${id}`, data);
    return res.data;
  },
  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/events/${id}`);
  },

  // Notices
  getNotices: async (): Promise<AdminNoticeResponse[]> => {
    const res = await apiClient.get(`${BASE}/notices`);
    return res.data;
  },
  createNotice: async (data: NoticeCreateRequest): Promise<AdminNoticeResponse> => {
    const res = await apiClient.post(`${BASE}/notices`, data);
    return res.data;
  },
  updateNotice: async (id: number, data: Partial<NoticeCreateRequest>): Promise<AdminNoticeResponse> => {
    const res = await apiClient.put(`${BASE}/notices/${id}`, data);
    return res.data;
  },
  deleteNotice: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/notices/${id}`);
  },

  // Gallery Albums
  getGalleryAlbums: async (): Promise<AdminGalleryAlbumResponse[]> => {
    const res = await apiClient.get(`${BASE}/gallery/albums`);
    return res.data;
  },
  createGalleryAlbum: async (data: GalleryAlbumCreateRequest): Promise<AdminGalleryAlbumResponse> => {
    const res = await apiClient.post(`${BASE}/gallery/albums`, data);
    return res.data;
  },
  updateGalleryAlbum: async (id: number, data: Partial<GalleryAlbumCreateRequest>): Promise<AdminGalleryAlbumResponse> => {
    const res = await apiClient.put(`${BASE}/gallery/albums/${id}`, data);
    return res.data;
  },
  deleteGalleryAlbum: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/gallery/albums/${id}`);
  },
  addImageToAlbum: async (album_id: number, data: GalleryImageCreateRequest): Promise<AdminGalleryImageResponse> => {
    const res = await apiClient.post(`${BASE}/gallery/albums/${album_id}/images`, data);
    return res.data;
  },
  deleteGalleryImage: async (image_id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/gallery/images/${image_id}`);
  },

  // Surname History
  getSurnameHistory: async (): Promise<AdminSurnameHistoryResponse[]> => {
    const res = await apiClient.get(`${BASE}/history`);
    return res.data;
  },
  createSurnameHistory: async (data: SurnameHistoryCreateRequest): Promise<AdminSurnameHistoryResponse> => {
    const res = await apiClient.post(`${BASE}/history`, data);
    return res.data;
  },
  updateSurnameHistory: async (id: number, data: Partial<SurnameHistoryCreateRequest>): Promise<AdminSurnameHistoryResponse> => {
    const res = await apiClient.put(`${BASE}/history/${id}`, data);
    return res.data;
  },
  deleteSurnameHistory: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/history/${id}`);
  },

  // Annual Reports
  getReports: async (): Promise<AdminAnnualReportResponse[]> => {
    const res = await apiClient.get(`${BASE}/reports`);
    return res.data;
  },
  createReport: async (data: AnnualReportCreateRequest): Promise<AdminAnnualReportResponse> => {
    const res = await apiClient.post(`${BASE}/reports`, data);
    return res.data;
  },
  updateReport: async (id: number, data: Partial<AnnualReportCreateRequest>): Promise<AdminAnnualReportResponse> => {
    const res = await apiClient.put(`${BASE}/reports/${id}`, data);
    return res.data;
  },
  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/reports/${id}`);
  },

  // Event Registrations
  getEventRegistrations: async (eventId: number): Promise<AdminEventRegistrationsSummaryResponse> => {
    const res = await apiClient.get(`${BASE}/events/${eventId}/registrations`);
    return res.data;
  },

  // Registration Requests
  getRegistrationRequests: async (status?: string): Promise<RegistrationRequestResponse[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get(`${BASE}/registrations`, { params });
    return res.data;
  },
  approveRegistrationRequest: async (id: number): Promise<RegistrationRequestResponse> => {
    const res = await apiClient.post(`${BASE}/registrations/${id}/approve`);
    return res.data;
  },
  rejectRegistrationRequest: async (id: number): Promise<RegistrationRequestResponse> => {
    const res = await apiClient.post(`${BASE}/registrations/${id}/reject`);
    return res.data;
  },

  // File Upload
  uploadFile: async (file: File, category: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`${BASE}/upload?category=${category}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};



