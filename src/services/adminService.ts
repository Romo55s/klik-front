import axios from 'axios';
import type { User } from '../interfaces/user.interface';
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
    // Admin-specific user management (role updates with suspended support)
    async updateUserRole(id: string, role: 'user' | 'admin' | 'suspended'): Promise<User> {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      return response.data;
    },

    // Admin-specific system monitoring
    async getSystemStats(): Promise<{
      totalUsers: number;
      activeUsers: number;
      totalProfiles: number;
      totalCards: number;
      recentScans: number;
      systemHealth: string;
    }> {
      const response = await api.get('/admin/stats');
      return response.data;
    },

    // Admin-specific error logs
    async getErrorLogs(): Promise<any[]> {
      const response = await api.get('/admin/error-logs');
      return response.data;
    },

    // Admin-specific card management
    async getAllCards(): Promise<any[]> {
      const response = await api.get('/admin/cards');
      return response.data.data || response.data; // Handle both {data: [...]} and [...] formats
    },

    async toggleCardStatus(cardId: string, isActive: boolean): Promise<void> {
      await api.put(`/admin/cards/${cardId}/status`, { is_active: isActive });
    }
  };
} 