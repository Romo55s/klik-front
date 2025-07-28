export interface Profile {
  profile_id: string;
  user_id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  background_image?: string | null;
  links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface AddLinkRequest {
  linkName: string;
  linkUrl: string;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  picture: string | null;
  profile?: Profile;
  role?: 'user' | 'admin' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  user: User;
  profile: Profile;
}

export interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  links?: Record<string, string>;
} 