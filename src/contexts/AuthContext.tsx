import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createUserService } from '../services/userService';
import type { UserWithProfile } from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userData: UserWithProfile | null;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [userData, setUserData] = useState<UserWithProfile | null>(null);

  const handleUserCreation = async () => {
    if (!user) return;

    try {
      console.log('Auth0 user data:', user)
      console.log('Audience api ->', import.meta.env.VITE_AUTH0_API_AUDIENCE);
      const tokenResponse = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_API_AUDIENCE,
          scope: 'openid profile email'
        },
        detailedResponse: true
      });
      const token = tokenResponse.access_token;
      console.log('Got access token:', token);
      const userService = createUserService(token);
      
      console.log('Attempting to get current user...');
      try {
        const currentUser = await userService.getCurrentUser();
        console.log('Current user found:', currentUser);
        setUserData(currentUser);
      } catch (error) {
        console.log('User not found, creating new user...');
        const newUser = await userService.createUser({
          email: user.name!,
          name: user.name || user.email!,
          picture: user.picture
        });
        console.log('New user created:', newUser);
        setUserData(newUser);
      }
    } catch (error) {
      console.error('Error in handleUserCreation:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      handleUserCreation();
    }
  }, [isAuthenticated, user]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    userData,
    login: loginWithRedirect,
    logout: () => auth0Logout({ logoutParams: { returnTo: window.location.origin } }),
    getAccessToken: () => getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_API_AUDIENCE,
        scope: 'openid profile email'
      }
    }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 