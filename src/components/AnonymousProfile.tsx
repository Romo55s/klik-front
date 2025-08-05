import React from 'react';
import type { Profile } from '../interfaces/user.interface';

interface AnonymousProfileProps {
  profile: Profile;
  links: Record<string, string>;
  user: {
    username: string;
    name: string;
    bio: string;
    avatar_url: string;
    email?: string;
  };
  backgroundUrl?: string;
  cardStatus?: 'active' | 'inactive' | 'loading' | 'error';
}

export const AnonymousProfile: React.FC<AnonymousProfileProps> = ({ profile, links, user, backgroundUrl, cardStatus }) => {

  // Debug: Log the received links data
  console.log('AnonymousProfile received links:', links);
  console.log('AnonymousProfile received backgroundUrl:', backgroundUrl);
  console.log('AnonymousProfile received user:', user);
  console.log('AnonymousProfile profile.background_image:', profile.background_image);
  console.log('Background image URL being used:', backgroundUrl || profile.background_image);
  
  // State to track image loading attempts
  const [imageLoadAttempt, setImageLoadAttempt] = React.useState(0);
  const [currentImageUrl, setCurrentImageUrl] = React.useState('');
  
  // Convert Google Drive thumbnail URL to different formats
  const getGoogleDriveUrls = (url: string): string[] => {
    if (url.includes('drive.google.com/thumbnail')) {
      const match = url.match(/id=([^&]+)/);
      if (match) {
        const fileId = match[1];
        return [
          url, // Original thumbnail URL
          `https://drive.google.com/uc?export=view&id=${fileId}`, // Direct view
          `https://drive.google.com/uc?id=${fileId}`, // Simple UC
          `https://drive.google.com/file/d/${fileId}/view`, // File view
        ];
      }
    }
    return [url];
  };
  
  const urls = getGoogleDriveUrls(backgroundUrl || profile.background_image || '');
  const currentUrl = urls[imageLoadAttempt] || urls[0];
  
  console.log('Available Google Drive URLs:', urls);
  console.log('Current image URL:', currentUrl);
  
  // Show deactivated card message if card status is inactive
  if (cardStatus === 'inactive') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Card Deactivated</h2>
          <p className="text-gray-600 mb-6">
            This business card has been deactivated and is no longer available for viewing.
          </p>
          <p className="text-gray-500 mb-8">
            If you believe this is an error, please contact the development team for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Background Image */}
        {(backgroundUrl || profile.background_image) && (
          <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            <img
              src={currentUrl}
              alt="Profile background"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Background image failed to load:', currentUrl);
                // Try next URL format
                if (imageLoadAttempt < urls.length - 1) {
                  setImageLoadAttempt(imageLoadAttempt + 1);
                  console.log('Trying next URL format...');
                } else {
                  console.log('All URL formats failed, hiding image');
                  e.currentTarget.style.display = 'none';
                  // Show a fallback gradient background
                  e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-purple-600');
                }
              }}
              onLoad={() => {
                console.log('Background image loaded successfully:', currentUrl);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        )}
        

        

        
        <div className={`text-center ${(backgroundUrl || profile.background_image) ? 'p-6 -mt-16 relative z-10' : 'p-6'}`}>
          <div className={`${(backgroundUrl || profile.background_image) ? 'bg-white rounded-lg shadow-lg p-4' : ''}`}>
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <h2 className="text-lg text-gray-500">@{user.username}</h2>
            {user.bio && (
              <p className="text-gray-600 mt-2 max-w-md mx-auto">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Links Section - Card Grid Layout */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Portfolio Links</h3>
        
        {!links || Object.keys(links).length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Links Available</h4>
            <p className="text-gray-500 mb-2">No links added to this profile yet.</p>
            <p className="text-gray-400 text-sm">The profile owner hasn't added any portfolio links yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(links).map(([name, url]) => (
              <div key={name} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg">{name}</h4>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                >
                  Visit {name}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 