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
  };
}

export const AnonymousProfile: React.FC<AnonymousProfileProps> = ({ profile, links, user }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="text-center mb-6">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100"
          />
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-lg">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-600 mt-2 max-w-md mx-auto">{user.bio}</p>
          )}
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
            <p className="text-gray-500">No portfolio links available yet.</p>
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