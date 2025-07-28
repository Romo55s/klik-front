import React, { useState } from 'react';
import { createImageService } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';

interface ProfileBackgroundManagerProps {
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
  onProfileUpdate: (updatedProfile: any) => void;
}

export const ProfileBackgroundManager: React.FC<ProfileBackgroundManagerProps> = ({
  profile,
  onProfileUpdate
}) => {
  const { getAccessToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackgroundUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      
      const token = await getAccessToken();
      const imageService = createImageService(token);
      
      const result = await imageService.uploadBackgroundImage(file);
      onProfileUpdate({ ...profile, background_image: result.data.imageUrl });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Background image uploaded successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error: any) {
      console.error('Error uploading background image:', error);
      setError(error.response?.data?.error || 'Failed to upload background image');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error.response?.data?.error || 'Failed to upload background image';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackgroundUpdate = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      
      const token = await getAccessToken();
      const imageService = createImageService(token);
      
      const result = await imageService.updateBackgroundImage(file);
      onProfileUpdate({ ...profile, background_image: result.data.imageUrl });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Background image updated successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error: any) {
      console.error('Error updating background image:', error);
      setError(error.response?.data?.error || 'Failed to update background image');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error.response?.data?.error || 'Failed to update background image';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackgroundRemove = async () => {
    if (!confirm('Are you sure you want to remove the background image?')) {
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);
      
      const token = await getAccessToken();
      const imageService = createImageService(token);
      
      await imageService.removeBackgroundImage();
      onProfileUpdate({ ...profile, background_image: null });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Background image removed successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error: any) {
      console.error('Error removing background image:', error);
      setError(error.response?.data?.error || 'Failed to remove background image');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error.response?.data?.error || 'Failed to remove background image';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Background</h3>
        <div className="text-sm text-gray-500">
          {profile.background_image ? 'Background set' : 'No background set'}
        </div>
      </div>
      
      <div className="space-y-6">
        {profile.background_image ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Current Background:</h4>
            <div className="relative">
              <img 
                src={profile.background_image} 
                alt="Profile Background"
                className="w-full h-48 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => document.getElementById('update-bg')?.click()}
                disabled={isUploading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Updating...' : 'Change Background'}
              </button>
              <button
                onClick={handleBackgroundRemove}
                disabled={isRemoving}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isRemoving ? 'Removing...' : 'Remove Background'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No background image set</p>
            <button
              onClick={() => document.getElementById('upload-bg')?.click()}
              disabled={isUploading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Background'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!profile.background_image && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">💡</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Add a Profile Background</h4>
                <p className="text-blue-700 text-sm">
                  Upload a background image to personalize your profile. This will be displayed behind your profile information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input 
        id="upload-bg" 
        type="file" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleBackgroundUpload(e.target.files[0])}
        className="hidden"
      />
      <input 
        id="update-bg" 
        type="file" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleBackgroundUpdate(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}; 