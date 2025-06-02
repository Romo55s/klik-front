import { useAuth } from '../contexts/AuthContext';

export function LogoutButton() {
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