import { createApiClient } from './api';

export type UserRole = 'user' | 'admin';

export interface User {
  user_id: string;
  email: string;
  profile_id?: string;
  url_id?: string;
  token_auth?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  profile_id: string;
  user_id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  user: User;
  profile: Profile;
}

export const createUserService = (token: string) => {
  const api = createApiClient(token);

  return {
    async createUser(profile: { email: string; name: string; picture?: string }) {
      try {
        console.log('Creating user with profile:', profile);
        const response = await api.createUser({
          email: profile.name,
          name: profile.name,
          avatar_url: profile.picture || null,
          bio: 'Welcome to my profile!'
        });
        console.log('User creation response:', response);
        return response as UserWithProfile;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },

    async getCurrentUser() {
      try {
        console.log('Fetching current user...');
        const response = await api.getCurrentUser();
        console.log('Current user response:', response);
        return response as UserWithProfile;
      } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
      }
    },

    async updateUserProfile(profile: Partial<Profile>) {
      try {
        console.log('Updating user profile:', profile);
        const response = await api.updateProfile({
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        });
        console.log('Profile update response:', response);
        return response as UserWithProfile;
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    },

    async deleteUser() {
      try {
        console.log('Deleting user...');
        await api.deleteCurrentUser();
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    }
  };
}; 