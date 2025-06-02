import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
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
  );
} 