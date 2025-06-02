import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginButton } from './LoginButton';
import { LogoutButton } from './LogoutButton';

export function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
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
  );
} 