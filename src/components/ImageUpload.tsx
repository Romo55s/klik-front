import React, { useState, useRef } from 'react';
import { createImageService } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';

interface ImageUploadProps {
  imageType?: 'background' | 'general';
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageUpdated?: (newImageUrl: string, oldImageUrl: string) => void;
  onImageDeleted?: () => void;
  className?: string;
  buttonText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageType = 'general',
  currentImageUrl,
  onImageUploaded,
  onImageUpdated,
  onImageDeleted,
  className = '',
  buttonText
}) => {
  const { getAccessToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const imageService = createImageService(token);

      if (currentImageUrl) {
        // Update existing image
        const response = await imageService.updateImage(file, currentImageUrl, imageType);
        onImageUpdated?.(response.data.newImageUrl, response.data.oldImageUrl);
        onImageUploaded(response.data.newImageUrl);
      } else {
        // Upload new image
        const response = await imageService.uploadImage(file, imageType);
        onImageUploaded(response.data.imageUrl);
      }

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = currentImageUrl ? 'Image updated successfully!' : 'Image uploaded successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = err.response?.data?.error || 'Failed to upload image';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setIsDeleting(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const imageService = createImageService(token);
      await imageService.deleteImage(currentImageUrl);
      onImageDeleted?.();

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Image deleted successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(err.response?.data?.error || 'Failed to delete image');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = err.response?.data?.error || 'Failed to delete image';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (currentImageUrl) return 'Change Image';
    return imageType === 'background' ? 'Upload Background' : 'Upload Image';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            getButtonText()
          )}
        </button>

        {currentImageUrl && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {currentImageUrl && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Image:</h4>
          <div className="relative inline-block">
            <img 
              src={currentImageUrl} 
              alt="Current" 
              className="max-w-xs max-h-48 rounded-lg shadow-md object-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 