import { useAuth } from '../contexts/AuthContext';

export function LoginButton() {
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