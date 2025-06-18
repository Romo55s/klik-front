export interface Profile {
  profile_id: string;
  user_id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
  role?: 'user' | 'admin';
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
} 