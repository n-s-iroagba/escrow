// src/lib/apiutils.ts
import API_ROUTES  from '@/constants/api-routes';
import axios, { AxiosResponse } from 'axios';
const route = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://agfc_server_app.fly.dev/api' : 'http://localhost:5000/api');
// Single axios instance
const api = axios.create({
  baseURL: route,
  timeout: 30000,
  withCredentials: true
});
const refreshApi = axios.create({
  baseURL: route,
  timeout: 30000,
  withCredentials: true
});

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const clearToken = () => {
  accessToken = null;
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;

  return null;
};

export const clearTokens = (): void => {
  accessToken = null;
};

// Helper function to determine if data is FormData or contains files
const isFormData = (data: any): boolean => {
  return data instanceof FormData;
};

const containsFiles = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;

  return Object.values(data).some((value) => {
    if (value instanceof File || value instanceof FileList) return true;
    if (Array.isArray(value)) {
      return value.some((item) => item instanceof File);
    }
    return false;
  });
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type based on payload for POST and PATCH
    if (['post', 'patch', 'put'].includes(config.method?.toLowerCase() || '')) {
      if (isFormData(config.data)) {
        // Let browser set Content-Type with boundary for FormData
        delete config.headers['Content-Type'];
      } else if (containsFiles(config.data)) {
        // Convert to FormData and let browser set Content-Type
        const formData = new FormData();
        Object.entries(config.data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value instanceof FileList) {
            Array.from(value).forEach((file, index) => {
              formData.append(`${key}[${index}]`, file);
            });
          } else if (
            Array.isArray(value) &&
            value.some((item) => item instanceof File)
          ) {
            value.forEach((file, index) => {
              formData.append(`${key}[${index}]`, file);
            });
          } else if (value !== null && value !== undefined) {
            formData.append(
              key,
              typeof value === 'object' ? JSON.stringify(value) : String(value)
            );
          }
        });
        config.data = formData;
        delete config.headers['Content-Type'];
      } else {
        // Regular JSON payload
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshApi.post(API_ROUTES.AUTH.REFRESH_ACCESS_TOKEN,

          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          }
        );

        const { data } = refreshResponse;

        if (data.accessToken) {
          setAccessToken(data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearTokens();

        // if (typeof window !== 'undefined') {
        //   window.location.href = '/auth/login';
        // }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;