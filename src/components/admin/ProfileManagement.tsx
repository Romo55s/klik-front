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
  const filteredProfiles = profiles.filter(profile => {
    if (!profile) return false;
    
    return (
      (profile.name && profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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

            {/* Profiles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Profiles ({filteredProfiles.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <tr key={profile.profile_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={profile.avatar_url || '/default-avatar.png'}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {profile.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {profile.profile_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {profile.bio || 'No bio'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Array.isArray(profile.links) ? profile.links.length : Object.keys(profile.links || {}).length} links
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedProfile(profile);
                        setShowProfileModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedProfile.name}</h4>
                  <p className="text-gray-500">Profile ID: {selectedProfile.profile_id}</p>
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
                      // Handle array format with key/value structure
                      selectedProfile.links.map((link: any, index: number) => {
                        const linkName = link.key || link.name || `Link ${index + 1}`;
                        const linkUrl = link.value || link.url || '#';
                        
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