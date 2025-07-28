import React, { useState, useEffect } from 'react';
import { createImageService } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';

interface ImagePreviewProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  showInfo?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  alt = 'Image',
  className = '',
  showInfo = false
}) => {
  const { getAccessToken } = useAuth();
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    if (showInfo && imageUrl) {
      loadImageInfo();
    }
  }, [imageUrl, showInfo]);

  const loadImageInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const imageService = createImageService(token);
      const response = await imageService.getImageInfo(imageUrl);
      setImageInfo(response.data);
    } catch (err: any) {
      console.error('Error loading image info:', err);
      setError(err.response?.data?.error || 'Failed to load image info');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  if (imageLoadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-auto rounded-lg shadow-md object-cover"
          onError={handleImageError}
        />
      </div>

      {showInfo && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Image Information</h4>
          
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Loading image info...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              Error: {error}
            </div>
          )}
          
          {imageInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File:</span>
                <span className="font-medium text-gray-900">{imageInfo.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">
                  {(parseInt(imageInfo.fileSize) / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {new Date(imageInfo.createdTime).toLocaleDateString()}
                </span>
              </div>
              {imageInfo.webViewLink && (
                <div className="pt-2">
                  <a 
                    href={imageInfo.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View in Google Drive
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 