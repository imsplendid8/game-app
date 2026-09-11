import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async register(email: string, password: string, profileName?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      profileName,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updatePassword(oldPassword: string, newPassword: string) {
    const response = await this.client.patch('/auth/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  // User endpoints
  async updateProfile(profileName: string, childrenAges: number[]) {
    const response = await this.client.patch('/users/profile', {
      profileName,
      childrenAges,
    });
    return response.data;
  }

  async getPreferences() {
    const response = await this.client.get('/users/preferences');
    return response.data;
  }

  async updatePreferences(preferences: Record<string, unknown>) {
    const response = await this.client.patch('/users/preferences', preferences);
    return response.data;
  }

  async addBookmark(experienceId: string, bookmarkType: string) {
    const response = await this.client.post('/users/bookmarks', {
      experienceId,
      bookmarkType,
    });
    return response.data;
  }

  async removeBookmark(experienceId: string) {
    const response = await this.client.delete(`/users/bookmarks/${experienceId}`);
    return response.data;
  }

  // Experience endpoints
  async getExperiences(params?: Record<string, unknown>) {
    const response = await this.client.get('/experiences', { params });
    return response.data;
  }

  async getExperienceById(id: string) {
    const response = await this.client.get(`/experiences/${id}`);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications(params?: Record<string, unknown>) {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.client.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.patch('/notifications/read-all');
    return response.data;
  }

  // Jobs endpoints
  async getCrawlerStats() {
    const response = await this.client.get('/jobs/crawler/stats');
    return response.data;
  }

  async getNotificationDeliveryStats() {
    const response = await this.client.get('/jobs/notification-delivery/stats');
    return response.data;
  }

  async triggerCrawler() {
    const response = await this.client.post('/jobs/crawler/trigger');
    return response.data;
  }

  async triggerNotificationDelivery() {
    const response = await this.client.post('/jobs/notification-delivery/trigger');
    return response.data;
  }
}

export const apiClient = new ApiClient();
