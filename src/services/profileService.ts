import axios from 'axios';
import type { Profile, ProfileFormData } from '../interfaces/user.interface';
import { API_BASE_URL } from '../utils/config';

export function createProfileService(token: string) {
  const api = axios.create({
    baseURL: API_BASE_URL,
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
      try {
        const response = await api.get('/profile/links');
        return response.data.links;
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User doesn't have a profile yet - this is normal for new users
          throw new Error('NO_PROFILE_FOUND');
        }
        throw error; // Re-throw other errors
      }
    },

    // Get links for a specific user (public)
    async getUserLinks(username: string): Promise<{ links: Record<string, string>; user: { username: string; name: string; bio: string; avatar_url: string } }> {
      const response = await api.get(`/profile/${username}/links`);
      return response.data;
    },

    // Get public profile data (no authentication required)
    async getPublicProfile(username: string): Promise<{ profile: Profile; cards: any[] }> {
      const publicApi = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      try {
        // Try to get the full profile data first
        const response = await publicApi.get(`/profile/${username}`);
        return response.data;
      } catch (error) {
        // Fallback to the links endpoint if the full profile endpoint doesn't work
        const response = await publicApi.get(`/profile/${username}/links`);
        return {
          profile: {
            profile_id: '',
            user_id: '',
            name: response.data.user.name,
            username: response.data.user.username,
            bio: response.data.user.bio,
            avatar_url: response.data.user.avatar_url,
            background_image: response.data.user.background_image || null,
            links: response.data.links,
            created_at: '',
            updated_at: ''
          },
          cards: []
        };
      }
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
      const response = await api.get('/admin/profiles');
      return response.data.data || response.data; // Handle both {data: [...]} and [...] formats
    },

    async getProfileById(id: string): Promise<Profile> {
      const response = await api.get(`/admin/profiles/${id}`);
      return response.data;
    }
  };
} 