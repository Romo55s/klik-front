import axios from 'axios';
import type { User, UserWithProfile, Profile } from '../interfaces/user.interface';
import type { ScanLog } from '../interfaces/scan.interface';
import { API_BASE_URL } from '../utils/config';

export function createAdminService(token: string) {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    // User management
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

    // Profile management
    async getAllProfiles(): Promise<Profile[]> {
      const response = await api.get('/profile');
      return response.data;
    },

    async getProfileById(id: string): Promise<Profile> {
      const response = await api.get(`/profile/${id}`);
      return response.data;
    },

    // Scan management
    async getAllScanLogs(): Promise<ScanLog[]> {
      const response = await api.get('/scans/all');
      return response.data;
    }
  };
} 