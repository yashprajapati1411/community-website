export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  TIMEOUT: 15000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      TOKEN: '/auth/token',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      CHANGE_PASSWORD: '/auth/change-password',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD_REQUEST_OTP: '/auth/forgot-password/request-otp',
      FORGOT_PASSWORD_VERIFY_OTP: '/auth/forgot-password/verify-otp',
      FORGOT_PASSWORD_RESET: '/auth/forgot-password/reset-password',
    },
    MEMBERS: {
      ME: '/members/me',
      DASHBOARD: '/members/dashboard',
      FAMILY: '/members/family',
      DIRECTORY: '/members/directory',
      ANNOUNCEMENTS: '/members/announcements',
    },
    BOOKINGS: {
      AVAILABILITY: '/bookings/availability',
      INQUIRY: '/bookings/inquiry',
      HISTORY: '/bookings/history',
    },
    PUBLIC: {
      COMMITTEE: '/public/committee',
      GALLERY_ALBUMS: '/public/gallery/albums',
      EVENTS: '/public/events',
      NOTICES: '/public/notices',
      HISTORY: '/public/history',
      REPORTS: '/public/reports',
    },
    ADMIN: {
      VERIFY_ROLE: '/admin/auth/verify-role',
      DASHBOARD_SUMMARY: '/admin/dashboard/summary',
      MEMBERS: '/admin/members',
      BOOKINGS_HISTORY: '/admin/bookings/history',
      COMMITTEE: '/admin/committee',
      EVENTS: '/admin/events',
      NOTICES: '/admin/notices',
      MEMBER_ANNOUNCEMENTS: '/admin/member-announcements',
      GALLERY_ALBUMS: '/admin/gallery/albums',
      GALLERY_IMAGES: '/admin/gallery/images',
      HISTORY: '/admin/history',
      REPORTS: '/admin/reports',
    },
  },
};


