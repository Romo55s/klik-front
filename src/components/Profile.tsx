import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProfileService } from '../services/profileService';
import { createUserService } from '../services/userService';
import { QRScanner } from './QRScanner';
import type { ProfileFormData } from '../interfaces/user.interface';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { isAuthenticated, user, userData, getAccessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getAccessToken();
        const userService = createUserService(token);
        const profileService = createProfileService(token);
        
        if (username) {
          // If username is provided in URL params, fetch that profile
          console.log('🔍 Fetching profile for username:', username);
          const response = await profileService.getProfileByUsername(username);
          console.log('✅ Profile data received:', response);
          setProfileData(response);
        } else if (isAuthenticated && userData?.user?.username) {
          // If no username in URL but user is authenticated, redirect to their profile
          console.log('ℹ️ Redirecting to user profile:', userData.user.username);
          navigate(`/profile/${userData.user.username}`);
          return;
        } else {
          // If not authenticated and no username, don't make any requests
          console.log('ℹ️ No profile request needed - not authenticated and no username');
          setProfileData(null);
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [isAuthenticated, getAccessToken, username, userData, navigate]);

  const handleEdit = () => {
    if (userData?.user) {
      setEditForm({
        name: userData.user.name || '',
        username: userData.user.username || '',
        bio: userData.user.bio || '',
        avatar_url: userData.user.avatar_url || ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAccessToken();
      const profileService = createProfileService(token);

      // Trim whitespace from all fields
      const trimmedForm = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatar_url: editForm.avatar_url.trim()
      };

      await profileService.updateProfile(trimmedForm);
      setIsEditing(false);
      // Refresh the profile data
      const userService = createUserService(token);
      const updatedUser = await userService.getCurrentUser();
      setProfileData(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getAccessToken();
        const profileService = createProfileService(token);
        const userService = createUserService(token);

        // First delete the profile
        await profileService.deleteProfile();
        
        // Then delete the user (this will also handle Auth0 deletion)
        await userService.deleteCurrentUser();
        
        // Finally, log out the user
        logout();
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQRScan = (scannedUsername: string) => {
    navigate(`/profile/${scannedUsername}/claim`);
  };

  const isOwnProfile = userData?.user?.username === username;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
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

  if (!isAuthenticated && !username) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {isEditing ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your username"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <img
              src={profileData.user.picture || user.picture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold">{profileData.user.name}</h2>
            <p className="text-gray-500">@{profileData.user.username}</p>
            <p className="text-gray-600">{profileData.user.bio}</p>
            <p className="text-gray-500 mt-2">{profileData.user.email}</p>
          </div>
          {isOwnProfile && (
            <div className="flex justify-center space-x-4">
              <QRScanner onScan={handleQRScan} />
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 