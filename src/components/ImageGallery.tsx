import React, { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImagePreview } from './ImagePreview';
import type { UserImage } from '../interfaces/image.interface';

interface ImageGalleryProps {
  userId: string;
  images: UserImage[];
  onImageAdded: (image: UserImage) => void;
  onImageRemoved: (imageId: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  userId,
  images,
  onImageAdded,
  onImageRemoved
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUploaded = (imageUrl: string) => {
    const newImage: UserImage = {
      id: Date.now().toString(),
      url: imageUrl,
      name: `Image ${images.length + 1}`,
      uploadedAt: new Date().toISOString(),
      imageType: 'general'
    };
    onImageAdded(newImage);
  };

  const handleImageDeleted = (imageId: string) => {
    onImageRemoved(imageId);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Image Gallery</h3>
        <div className="text-sm text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="border-b pb-6">
          <ImageUpload
            imageType="general"
            onImageUploaded={handleImageUploaded}
            buttonText="Add New Image"
          />
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Images Yet</h4>
            <p className="text-gray-500">Upload your first image to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <ImagePreview
                    imageUrl={image.url}
                    alt={image.name}
                    className="h-48"
                    showInfo={false}
                  />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 truncate">{image.name}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image.url)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleImageDeleted(image.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ImagePreview
                imageUrl={selectedImage}
                alt="Full size"
                className="max-h-[70vh]"
                showInfo={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 