import axios from 'axios';
import type { User, Profile, ProfileFormData } from '../interfaces/user.interface';
import type { Card } from '../interfaces/card.interface';
import type { ScanLog } from '../interfaces/scan.interface';
import { API_BASE_URL } from '../utils/config';

export interface UserWithProfile {
  user: User;
  profile: Profile;
}

export function createUserService(token: string) {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    // User methods
    async createUser(data: { email: string; name: string; picture: string; username: string }): Promise<UserWithProfile> {
      const response = await api.post('/users', data);
      return response.data;
    },

    async getCurrentUser(): Promise<UserWithProfile> {
      const response = await api.get('/users/me');
      return response.data;
    },

    async getUserByUsername(username: string): Promise<UserWithProfile> {
      const response = await api.get(`/users/username/${username}`);
      return response.data;
    },

    async updateCurrentUser(data: { email?: string; name?: string; bio?: string; avatar_url?: string }): Promise<UserWithProfile> {
      const response = await api.put('/users/me', data);
      return response.data;
    },

    async deleteCurrentUser(): Promise<void> {
      await api.delete('/users/me');
    },

    // Admin methods
    async getAllUsers(): Promise<UserWithProfile[]> {
      const response = await api.get('/admin/users');
      return response.data.data || response.data; // Handle both {data: [...]} and [...] formats
    },

    async getUserById(id: string): Promise<User> {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },

    async updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      return response.data;
    },

    async deleteUser(id: string): Promise<void> {
      await api.delete(`/admin/users/${id}`);
    },

    async getAllProfiles(): Promise<Profile[]> {
      const response = await api.get('/admin/profiles');
      return response.data.data || response.data; // Handle both {data: [...]} and [...] formats
    },

    async getProfileById(id: string): Promise<Profile> {
      const response = await api.get(`/admin/profiles/${id}`);
      return response.data;
    },

    async getAllScanLogs(): Promise<ScanLog[]> {
      const response = await api.get('/admin/scans');
      return response.data.data || response.data; // Handle both {data: [...]} and [...] formats
    }
  };
} 