import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProfileService } from '../services/profileService';
import { createUserService } from '../services/userService';
import { createCardService } from '../services/cardService';
import { QRScanner } from './QRScanner';
import { CardManager } from './CardManager';
import { AddLinkForm } from './AddLinkForm';
import { ProfileLinks } from './ProfileLinks';
import { AnonymousProfile } from './AnonymousProfile';
import { DeleteAccountModal } from './DeleteAccountModal';
import { useRateLimit } from '../hooks/useRateLimit';
import type { ProfileFormData } from '../interfaces/user.interface';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { isAuthenticated, user, userData, getAccessToken, logout } = useAuth();
  const navigate = useNavigate();
  
  // Rate limiting hooks
  const { checkLimit: checkProfileUpdateLimit, getTimeRemaining: getProfileUpdateTimeRemaining } = useRateLimit('PROFILE_UPDATES', userData?.user?.user_id);
  const { checkLimit: checkLinkLimit, getTimeRemaining: getLinkTimeRemaining } = useRateLimit('LINK_MANAGEMENT', userData?.user?.user_id);
  
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
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasCard, setHasCard] = useState<boolean | null>(null);
  const [userLinks, setUserLinks] = useState<Record<string, string> | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (username) {
          // If username is provided in URL params, fetch that profile
          console.log('🔍 Fetching profile for username:', username);
          
          if (isAuthenticated) {
            // Authenticated user - use authenticated service
            const token = await getAccessToken();
            const profileService = createProfileService(token);
            const response = await profileService.getProfileByUsername(username);
            console.log('✅ Profile data received:', response);
            setProfileData(response);
          } else {
            // Anonymous user - use public service
            const profileService = createProfileService('');
            const response = await profileService.getPublicProfile(username);
            console.log('✅ Public profile data received:', response);
            setProfileData(response);
          }
        } else if (isAuthenticated && userData?.user?.username) {
          // If no username in URL but user is authenticated, redirect to their profile
          console.log('ℹ️ Redirecting to user profile:', userData.user.username);
          navigate(`/profile/${userData.user.username}`);
          return;
        } else if (isAuthenticated && !userData?.user?.username) {
          // Authenticated user but no username - might be a new user
          console.log('ℹ️ Authenticated user without username - showing welcome message');
          setProfileData(null);
        } else {
          // If not authenticated and no username, don't make any requests
          console.log('ℹ️ No profile request needed - not authenticated and no username');
          setProfileData(null);
        }
      } catch (error: any) {
        console.error('❌ Error fetching profile:', error);
        if (error.response?.status === 404) {
          // Profile not found - this is normal for new users
          console.log('ℹ️ Profile not found - showing welcome message for new user');
          setProfileData(null);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a username or need to redirect
    if (username || (isAuthenticated && userData?.user?.username && !username)) {
      initializeUser();
    } else if (!isAuthenticated && !username) {
      // Anonymous user with no username - don't fetch anything
      setIsLoading(false);
    }
  }, [username, isAuthenticated, userData?.user?.username, getAccessToken, navigate]);

  const isOwnProfile = userData?.user?.username === username;

  // Check if user has a card and fetch links
  useEffect(() => {
    if (isOwnProfile) {
      // Viewing own profile - fetch own links and check card
      checkUserCard();
      fetchUserLinks();
    } else if (username && isAuthenticated) {
      // Viewing someone else's profile - fetch their links
      fetchOtherUserLinks(username);
    }
  }, [isOwnProfile, username, isAuthenticated, userData?.user?.username]);

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
      // Check rate limit before updating profile
      if (!checkProfileUpdateLimit()) {
        const timeRemaining = getProfileUpdateTimeRemaining();
        setError(`Rate limit exceeded. Try again in ${timeRemaining} seconds.`);
        return;
      }

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

  const checkUserCard = async () => {
    if (!isAuthenticated || !userData?.user?.username) return;
    
    try {
      const token = await getAccessToken();
      const cardService = createCardService(token);
      await cardService.getCard();
      setHasCard(true);
    } catch (error: any) {
      if (error.message === 'NO_CARD_FOUND') {
        setHasCard(false);
      } else {
        setHasCard(null); // Error state
      }
    }
  };

  const fetchUserLinks = async () => {
    if (!isAuthenticated || !userData?.user?.username) return;
    
    try {
      setLoadingLinks(true);
      const token = await getAccessToken();
      const profileService = createProfileService(token);
      const links = await profileService.getLinks();
      setUserLinks(links);
    } catch (error: any) {
      if (error.message === 'NO_PROFILE_FOUND') {
        // User doesn't have a profile yet - this is normal for new users
        console.log('No profile found for user - this is normal for new users');
        setUserLinks({});
      } else {
        console.error('Error fetching user links:', error);
        setUserLinks(null);
      }
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchOtherUserLinks = async (targetUsername: string) => {
    try {
      setLoadingLinks(true);
      const token = await getAccessToken();
      const profileService = createProfileService(token);
      const { links, user } = await profileService.getUserLinks(targetUsername);
      setUserLinks(links);
      // Note: We could also update profile data with user info if needed
    } catch (error) {
      console.error('Error fetching other user links:', error);
      setUserLinks(null);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
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
      setShowDeleteModal(false);
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = (scannedUsername: string) => {
    navigate(`/profile/${scannedUsername}/claim`, { replace: true });
  };

  const handleAddLink = async (linkName: string, linkUrl: string) => {
    try {
      // Check if user has a card first
      if (hasCard !== true) {
        throw new Error('You need to create a digital card before adding links.');
      }

      // Check rate limit before adding link
      if (!checkLinkLimit()) {
        const timeRemaining = getLinkTimeRemaining();
        throw new Error(`Rate limit exceeded. Try again in ${timeRemaining} seconds.`);
      }

      const token = await getAccessToken();
      const profileService = createProfileService(token);
      await profileService.addLink(linkName, linkUrl);
      
      // Refresh links
      await fetchUserLinks();
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Link added successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setShowAddLinkForm(false);
    } catch (error) {
      console.error('Error adding link:', error);
      throw error;
    }
  };

  const handleRemoveLink = async (linkName: string) => {
    try {
      // Check if user has a card first
      if (hasCard !== true) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'You need to create a digital card before managing links.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        return;
      }

      // Check rate limit before removing link
      if (!checkLinkLimit()) {
        const timeRemaining = getLinkTimeRemaining();
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = `Rate limit exceeded. Try again in ${timeRemaining} seconds.`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        return;
      }

      const token = await getAccessToken();
      const profileService = createProfileService(token);
      await profileService.removeLink(linkName);
      
      // Refresh links
      await fetchUserLinks();
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Link removed successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error removing link:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to remove link';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

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
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Profile!</h2>
          <p className="text-gray-600 mb-6">
            It looks like you're new here. Let's set up your profile to get started.
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Your Profile</h3>
                <p className="text-sm text-gray-600">Add your name, bio, and personal information</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Your Links</h3>
                <p className="text-sm text-gray-600">Connect your social media and professional profiles</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Your Digital Card</h3>
                <p className="text-sm text-gray-600">Scan a QR code to create your digital business card</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Setting Up Your Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show anonymous profile view for non-authenticated users viewing someone's profile
  if (!isAuthenticated && username && profileData && profileData.profile) {
    return (
      <AnonymousProfile
        profile={profileData.profile}
        links={profileData.profile.links || {}}
        user={{
          username: profileData.profile.username || '',
          name: profileData.profile.name || '',
          bio: profileData.profile.bio || '',
          avatar_url: profileData.profile.avatar_url || ''
        }}
      />
    );
  }

  // Safety check - if we don't have user data, show welcome message
  if (!profileData?.user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Profile!</h2>
          <p className="text-gray-600 mb-6">
            It looks like you're new here. Let's set up your profile to get started.
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Your Profile</h3>
                <p className="text-sm text-gray-600">Add your name, bio, and personal information</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Your Links</h3>
                <p className="text-sm text-gray-600">Connect your social media and professional profiles</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Your Digital Card</h3>
                <p className="text-sm text-gray-600">Scan a QR code to create your digital business card</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Setting Up Your Profile
            </button>
          </div>
        </div>
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

            <div className="flex justify-between items-center">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete Account
              </button>
              <div className="flex space-x-4">
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
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="text-center mb-6">
            <img
              src={profileData.user?.picture || user?.picture || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold">{profileData.user?.name || 'Your Name'}</h2>
            <p className="text-gray-500">@{profileData.user?.username || 'username'}</p>
            <p className="text-gray-600">{profileData.user?.bio || 'No bio yet'}</p>
            <p className="text-gray-500 mt-2">{profileData.user?.email || 'No email'}</p>
          </div>
          {isOwnProfile && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center space-x-4">
                {hasCard === false && (
                  <QRScanner onScan={handleQRScan} />
                )}
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Edit Profile
                </button>
              </div>
              {hasCard === false && (
                <p className="text-gray-600 text-sm text-center">
                  💡 <strong>Tip:</strong> Use the QR Scanner to scan a physical card and create your digital business card!
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Links Section */}
      {!isEditing && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          {isOwnProfile && showAddLinkForm && hasCard === true && (
            <AddLinkForm 
              onAdd={handleAddLink} 
              onCancel={() => setShowAddLinkForm(false)} 
            />
          )}
          
          {isOwnProfile && !showAddLinkForm && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Links</h3>
              {hasCard === true ? (
                <button
                  onClick={() => setShowAddLinkForm(true)}
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-colors duration-200"
                >
                  Add Link
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-300 text-gray-500 font-semibold rounded-lg shadow-sm cursor-not-allowed"
                  title="You need to create a digital card first"
                >
                  Add Link
                </button>
              )}
            </div>
          )}
          
          {loadingLinks ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading links...</span>
            </div>
          ) : (
            <>
              <ProfileLinks 
                links={userLinks || undefined} 
                onRemove={isOwnProfile && hasCard === true ? handleRemoveLink : undefined}
                editable={isOwnProfile && hasCard === true}
              />
              {isOwnProfile && (!userLinks || Object.keys(userLinks).length === 0) && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">💡</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        {hasCard === true ? 'Add Your First Link' : 'Create Your Digital Card First'}
                      </h4>
                      <p className="text-blue-700 text-sm">
                        {hasCard === true 
                          ? 'Start building your portfolio by adding links to your social media profiles, personal website, or professional platforms like LinkedIn.'
                          : 'You need to create a digital business card before you can add portfolio links. Use the QR Scanner above to scan a physical card and get started!'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Card Management Section - Only show for own profile */}
      {!isEditing && isOwnProfile && profileData.user && (
        <CardManager username={profileData.user.username} userId={profileData.user.user_id} />
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
} 