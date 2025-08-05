import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
  refreshUserData: () => Promise<void>;
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
  const [tokenCache, setTokenCache] = useState<{ token: string; expiresAt: number } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cached token getter with automatic refresh
  const getCachedToken = useCallback(async (): Promise<string> => {
    const now = Date.now();
    
    // Check if we have a valid cached token
    if (tokenCache && tokenCache.expiresAt > now + 60000) { // 1 minute buffer
      return tokenCache.token;
    }

    // Get new token
    try {
      const tokenResponse = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_API_AUDIENCE,
          scope: 'openid profile email'
        },
        detailedResponse: true
      });
      
      const token = tokenResponse.access_token;
      const expiresAt = now + (tokenResponse.expires_in * 1000);
      
      // Cache the token
      setTokenCache({ token, expiresAt });
      
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }, [getAccessTokenSilently, tokenCache]);

  const handleUserCreation = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getCachedToken();
      const userService = createUserService(token);
      
      try {
        const currentUser = await userService.getCurrentUser();
        setUserData(currentUser);
      } catch (error) {
        const newUser = await userService.createUser({
          email: user.email!,
          name: user.name || user.email!,
          picture: user.picture || '',
          username: '' // Let the backend handle the username
        });
        setUserData(newUser);
      }
    } catch (error) {
      console.error('Error in handleUserCreation:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [user, getCachedToken]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = await getCachedToken();
      const userService = createUserService(token);
      const currentUser = await userService.getCurrentUser();
      setUserData(currentUser);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user, getCachedToken]);

  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      handleUserCreation();
    }
  }, [isAuthenticated, user, isInitialized, handleUserCreation]);

  const value = useMemo(() => ({
    isAuthenticated,
    isLoading,
    user,
    userData,
    login: loginWithRedirect,
    logout: () => auth0Logout({ logoutParams: { returnTo: window.location.origin } }),
    getAccessToken: getCachedToken,
    refreshUserData,
  }), [isAuthenticated, isLoading, user, userData, loginWithRedirect, auth0Logout, getCachedToken, refreshUserData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 