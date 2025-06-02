import axios from 'axios';
import type { User, UserWithProfile, Profile, ProfileFormData } from '../interfaces/user.interface';
import type { Card } from '../interfaces/card.interface';
import type { ScanLog } from '../interfaces/scan.interface';

export function createUserService(token: string) {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    // User methods
    async getCurrentUser(): Promise<UserWithProfile> {
      const response = await api.get('/users/me');
      return response.data;
    },

    async updateCurrentUser(data: { email?: string; name?: string; bio?: string; avatar_url?: string }): Promise<UserWithProfile> {
      const response = await api.put('/users/me', data);
      return response.data;
    },

    async deleteCurrentUser(): Promise<void> {
      await api.delete('/users/me');
    },

    // Profile methods
    async getProfile(): Promise<Profile> {
      const response = await api.get('/profiles');
      return response.data;
    },

    async updateUserProfile(profileData: ProfileFormData): Promise<Profile> {
      const response = await api.put('/profiles', profileData);
      return response.data;
    },

    async deleteProfile(): Promise<void> {
      await api.delete('/profiles');
    },

    // Card methods
    async createCard(data: { cardId: string; name: string; description: string }): Promise<Card> {
      const response = await api.post('/cards', data);
      return response.data;
    },

    async getCards(): Promise<Card[]> {
      const response = await api.get('/cards');
      return response.data;
    },

    async getCard(id: string): Promise<Card> {
      const response = await api.get(`/cards/${id}`);
      return response.data;
    },

    async updateCard(id: string, data: { name?: string; description?: string }): Promise<Card> {
      const response = await api.put(`/cards/${id}`, data);
      return response.data;
    },

    async deleteCard(id: string): Promise<void> {
      await api.delete(`/cards/${id}`);
    },

    // Scan methods
    async createScanLog(data: { card_id: string; scan_type?: string; location?: string; device_info?: string }): Promise<ScanLog> {
      const response = await api.post('/scan-logs', data);
      return response.data;
    },

    async getScanLogs(): Promise<ScanLog[]> {
      const response = await api.get('/scan-logs');
      return response.data;
    },

    async getScanLog(id: string): Promise<ScanLog> {
      const response = await api.get(`/scan-logs/${id}`);
      return response.data;
    },

    async deleteScanLog(id: string): Promise<void> {
      await api.delete(`/scan-logs/${id}`);
    },

    async getScanLogsByCard(cardId: string): Promise<ScanLog[]> {
      const response = await api.get(`/scan-logs/card/${cardId}`);
      return response.data;
    },

    // Admin methods
    async getAllUsers(): Promise<UserWithProfile[]> {
      const response = await api.get('/users');
      return response.data;
    },

    async getUserById(id: string): Promise<User> {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },

    async updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data;
    },

    async deleteUser(id: string): Promise<void> {
      await api.delete(`/users/${id}`);
    },

    async getAllProfiles(): Promise<Profile[]> {
      const response = await api.get('/profiles');
      return response.data;
    },

    async getProfileById(id: string): Promise<Profile> {
      const response = await api.get(`/profiles/${id}`);
      return response.data;
    },

    async getAllScanLogs(): Promise<ScanLog[]> {
      const response = await api.get('/scan-logs');
      return response.data;
    }
  };
} 