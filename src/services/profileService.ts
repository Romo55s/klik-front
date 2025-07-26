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

    // Get links for authenticated user
    async getLinks(): Promise<Record<string, string>> {
      const response = await api.get('/profile/links');
      return response.data.links;
    },

    // Get links for a specific user (public)
    async getUserLinks(username: string): Promise<{ links: Record<string, string>; user: { username: string; name: string; bio: string; avatar_url: string } }> {
      const response = await api.get(`/profile/${username}/links`);
      return response.data;
    },

    async addLink(linkName: string, linkUrl: string): Promise<Profile> {
      const response = await api.post('/profile/links', { linkName, linkUrl });
      return response.data;
    },

    async removeLink(linkName: string): Promise<Profile> {
      const response = await api.delete(`/profile/links/${encodeURIComponent(linkName)}`);
      return response.data;
    },

    async getProfileByUsername(username: string): Promise<{ profile: Profile; cards: any[] }> {
      const response = await api.get(`/profile/${username}`);
      return response.data;
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