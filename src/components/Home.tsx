import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export function Home() {
  const { isAuthenticated, userData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect admin users to admin panel
  useEffect(() => {
    if (isAuthenticated && userData?.user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, userData, navigate]);

  const handleGoToProfile = () => {
    setError(null);
    try {
      if (userData && userData.user && userData.user.username) {
        navigate(`/profile/${userData.user.username}`);
      } else {
        setError('User data or username is missing.');
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error occurred during navigation.');
    }
  };

  return (
    <div className="text-center text-black">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your App</h1>
      {error && (
        <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">
          <strong>Error:</strong> {error}
          <br />
          <pre className="text-xs text-left whitespace-pre-wrap">{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
      {isAuthenticated ? (
        <button
          onClick={handleGoToProfile}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          View Profile
        </button>
      ) : (
        <p>Please log in to access your profile</p>
      )}
      <div className="mt-4 text-left max-w-xl mx-auto">
        <strong>userData debug:</strong>
        <pre className="bg-gray-200 p-2 rounded text-xs whitespace-pre-wrap">{JSON.stringify(userData, null, 2)}</pre>
      </div>
    </div>
  );
} 