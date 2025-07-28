import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface ProfileWithImages {
  profile: {
    profile_id: string;
    name: string;
    bio: string;
    background_image?: string;
    qr_code_url?: string;
    avatar_url?: string;
    links?: Record<string, string>;
    created_at: string;
    updated_at: string;
    user_id: string;
  };
  images: {
    background?: string;
    qrCode?: string;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
    originalName: string;
    uploadedAt: string;
  };
}

export interface ImageInfoResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    fileSize: string;
    createdTime: string;
    webViewLink: string;
    directUrl: string;
  };
}

export function createImageService(token: string) {
  const api = axios.create({
    baseURL: `${API_BASE_URL}/images`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // Increased timeout for file uploads
  });

  return {
    // Background Image Management
    async uploadBackgroundImage(file: File): Promise<ImageUploadResponse> {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    async updateBackgroundImage(file: File): Promise<ImageUploadResponse> {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.put('/background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    async removeBackgroundImage(): Promise<void> {
      await api.delete('/background');
    },

    // General Image Management
    async uploadGeneralImage(file: File): Promise<ImageUploadResponse> {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/general', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    async deleteImage(imageUrl: string): Promise<void> {
      await api.delete('/delete', { data: { imageUrl } });
    },

    // Profile and Image Info
    async getProfileWithImages(): Promise<ProfileWithImages> {
      const response = await api.get('/profile');
      return response.data.data;
    },

    async getImageInfo(imageUrl: string): Promise<ImageInfoResponse> {
      const response = await api.get(`/info?imageUrl=${encodeURIComponent(imageUrl)}`);
      return response.data;
    }
  };
} 