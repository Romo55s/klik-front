import React, { useState, useEffect } from 'react';
import { createProfileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../interfaces/user.interface';

export const ProfileManagement: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const profileService = createProfileService(token);
      const profilesData = await profileService.getAllProfiles();
      // Ensure profilesData is an array
      const profilesArray = Array.isArray(profilesData) ? profilesData : [];
      setProfiles(profilesArray);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Profile Management</h2>
          <p className="mt-2 text-gray-600">Manage all user profiles in the system</p>
        </div>
        <button
          onClick={fetchProfiles}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <label htmlFor="profile-search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Profiles
        </label>
        <input
          type="text"
          id="profile-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, username, or bio..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.profile_id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <img
                className="h-12 w-12 rounded-full"
                src={profile.avatar_url || '/default-avatar.png'}
                alt=""
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Links:</span>
                <span className="font-medium">
                  {Object.keys(profile.links || {}).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedProfile(profile);
                setShowProfileModal(true);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No profiles found matching your search.</p>
        </div>
      )}

      {/* Profile Detail Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full"
                  src={selectedProfile.avatar_url || '/default-avatar.png'}
                  alt=""
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedProfile.name}</h4>
                  <p className="text-gray-500">@{selectedProfile.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile ID</label>
                  <p className="text-sm text-gray-900">{selectedProfile.profile_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900">{selectedProfile.user_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedProfile.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedProfile.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedProfile.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-900">{selectedProfile.bio}</p>
                </div>
              )}
              
              {selectedProfile.links && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Links</label>
                  <div className="mt-2 space-y-2">
                    {Array.isArray(selectedProfile.links) ? (
                      // Handle array format
                      selectedProfile.links.map((link: any, index: number) => {
                        const linkName = typeof link === 'object' && link.name ? link.name : `Link ${index + 1}`;
                        const linkUrl = typeof link === 'object' && link.url ? link.url : 
                                       typeof link === 'object' && (link as any).value ? (link as any).value :
                                       typeof link === 'string' ? link : '#';
                        
                        return (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{linkName}</span>
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate ml-2"
                            >
                              {linkUrl}
                            </a>
                          </div>
                        );
                      })
                    ) : typeof selectedProfile.links === 'object' && Object.keys(selectedProfile.links).length > 0 ? (
                      // Handle object format
                      Object.entries(selectedProfile.links).map(([name, url]) => {
                        const linkUrl = typeof url === 'object' && (url as any).value ? (url as any).value :
                                       typeof url === 'string' ? url : '#';
                        
                        return (
                          <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{name}</span>
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate ml-2"
                            >
                              {linkUrl}
                            </a>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No links found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 