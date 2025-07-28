export interface UserImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  imageType?: 'background' | 'general';
}

export interface ImageUploadRequest {
  image: File;
  imageType: 'background' | 'general';
}

export interface ImageUpdateRequest {
  image: File;
  oldImageUrl: string;
  imageType: 'background' | 'general';
}

export interface ImageDeleteRequest {
  imageUrl: string;
} 