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
    },
    MEMBERS: {
      ME: '/members/me',
      DASHBOARD: '/members/dashboard',
      FAMILY: '/members/family',
    },
  },
};
