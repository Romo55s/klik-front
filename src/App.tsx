import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { createApiClient } from './services/api';
import { createUserService } from './services/userService';
import type { UserWithProfile } from './services/userService';
import { useState, useEffect } from 'react';
import './App.css';

function LoginButton() {
  const { login } = useAuth();
  return (
    <button 
      onClick={login} 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Log In
    </button>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button 
      onClick={logout} 
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Log Out
    </button>
  );
}

function Profile() {
  const { isAuthenticated, user, userData, getAccessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getAccessToken();
        const userService = createUserService(token);
        await userService.getCurrentUser();
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      initializeUser();
    }
  }, [isAuthenticated, getAccessToken]);

  const handleEdit = () => {
    if (userData?.profile) {
      setEditForm({
        name: userData.profile.name,
        bio: userData.profile.bio,
        avatar_url: userData.profile.avatar_url || ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAccessToken();
      const userService = createUserService(token);
      await userService.updateUserProfile(editForm);
      setIsEditing(false);
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
        const userService = createUserService(token);
        await userService.deleteUser();
        logout();
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated || !userData) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      {isEditing ? (
        <div className="edit-form">
          <h2>Edit Profile</h2>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Name"
          />
          <textarea
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Bio"
          />
          <input
            type="text"
            value={editForm.avatar_url}
            onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
            placeholder="Avatar URL"
          />
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-info">
          <h2>Profile</h2>
          <img src={userData.profile.avatar_url || user.picture} alt="Profile" />
          <h3>{userData.profile.name}</h3>
          <p>{userData.profile.bio}</p>
          <p>Email: {userData.user.email}</p>
          <button onClick={handleEdit}>Edit Profile</button>
          <button onClick={handleDelete}>Delete Account</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold">Your App</span>
                </Link>
              </div>
              <div className="flex items-center">
                {!isAuthenticated ? <LoginButton /> : <LogoutButton />}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Welcome to Your App</h1>
                {isAuthenticated ? (
                  <Link 
                    to="/profile" 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View Profile
                  </Link>
                ) : (
                  <p>Please log in to access your profile</p>
                )}
              </div>
            } />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Wrap the App with AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
