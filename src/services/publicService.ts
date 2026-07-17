import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface CommitteeMemberResponse {
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

export interface GalleryImageResponse {
  id: number;
  album_id: number;
  caption?: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbumResponse {
  id: number;
  title: string;
  description?: string;
  cover_image?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbumWithImagesResponse extends GalleryAlbumResponse {
  images: GalleryImageResponse[];
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  status?: string;
  cover_image?: string;
  is_featured?: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  form_fields?: string[];
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NoticeResponse {
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
  published_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SurnameHistoryResponse {
  id: number;
  surname: string;
  native_region: string;
  history: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualReportResponse {
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

export interface EventRegistrationRequest {
  name: string;
  mobile?: string;
  email?: string;
  member_count: number;
  remarks?: string;
}

export interface EventRegistrationResponse extends EventRegistrationRequest {
  id: number;
  event_id: number;
  user_id?: number;
  status: string;
  created_at?: string;
}


export const publicService = {
  getCommittee: async (): Promise<CommitteeMemberResponse[]> => {
    const response = await apiClient.get<CommitteeMemberResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.COMMITTEE);
    return response.data;
  },
  getGalleryAlbums: async (): Promise<GalleryAlbumResponse[]> => {
    const response = await apiClient.get<GalleryAlbumResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.GALLERY_ALBUMS);
    return response.data;
  },
  getGalleryAlbumById: async (id: number): Promise<GalleryAlbumWithImagesResponse> => {
    const response = await apiClient.get<GalleryAlbumWithImagesResponse>(`${API_CONFIG.ENDPOINTS.PUBLIC.GALLERY_ALBUMS}/${id}`);
    return response.data;
  },
  getEvents: async (): Promise<EventResponse[]> => {
    const response = await apiClient.get<EventResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.EVENTS);
    return response.data;
  },
  getNotices: async (): Promise<NoticeResponse[]> => {
    const response = await apiClient.get<NoticeResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.NOTICES);
    return response.data;
  },
  getSurnameHistory: async (): Promise<SurnameHistoryResponse[]> => {
    const response = await apiClient.get<SurnameHistoryResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.HISTORY);
    return response.data;
  },
  getSurnameHistoryById: async (id: number): Promise<SurnameHistoryResponse> => {
    const response = await apiClient.get<SurnameHistoryResponse>(`${API_CONFIG.ENDPOINTS.PUBLIC.HISTORY}/${id}`);
    return response.data;
  },
  getAnnualReports: async (): Promise<AnnualReportResponse[]> => {
    const response = await apiClient.get<AnnualReportResponse[]>(API_CONFIG.ENDPOINTS.PUBLIC.REPORTS);
    return response.data;
  },
  registerForEvent: async (eventId: number, data: EventRegistrationRequest): Promise<EventRegistrationResponse> => {
    const response = await apiClient.post<EventRegistrationResponse>(`${API_CONFIG.ENDPOINTS.PUBLIC.EVENTS}/${eventId}/register`, data);
    return response.data;
  },
};

