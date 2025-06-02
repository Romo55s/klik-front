import axios from 'axios';
import type { Profile, ProfileFormData } from '../interfaces/user.interface';

export function createProfileService(token: string) {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    // User profile methods
    async getProfile(): Promise<Profile> {
      const response = await api.get('/profile/me');
      return response.data;
    },

    async updateProfile(profileData: ProfileFormData): Promise<Profile> {
      const response = await api.put('/profile/me', profileData);
      return response.data;
    },

    async deleteProfile(): Promise<void> {
      await api.delete('/profile/me');
    },

    // Admin profile methods
    async getAllProfiles(): Promise<Profile[]> {
      const response = await api.get('/profile');
      return response.data;
    },

    async getProfileById(id: string): Promise<Profile> {
      const response = await api.get(`/profile/${id}`);
      return response.data;
    }
  };
} 