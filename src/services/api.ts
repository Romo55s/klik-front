import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchWithAuth(endpoint: string, token: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`Making ${options.method || 'GET'} request to ${API_BASE_URL}${endpoint}`);
  console.log('Request headers:', headers);
  if (options.body) {
    console.log('Request body:', options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log('Response status:', response.status);
  const responseData = await response.json();
  console.log('Response data:', responseData);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return responseData;
}

export const createApiClient = (token: string) => ({
  // User endpoints
  createUser: (data: any) => fetchWithAuth('/users', token, {
    method: 'POST',
    body: JSON.stringify({
      email: data.name,
      password: 'temporary-password', // This will be replaced by Auth0
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio
    }),
  }),
  getCurrentUser: () => fetchWithAuth('/users/me', token),
  updateCurrentUser: (data: any) => fetchWithAuth('/users/me', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCurrentUser: () => fetchWithAuth('/users/me', token, {
    method: 'DELETE',
  }),

  // Profile endpoints
  getProfile: () => fetchWithAuth('/users/me', token),
  updateProfile: (data: any) => fetchWithAuth('/users/me', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Admin endpoints
  getAllUsers: () => fetchWithAuth('/users', token),
  updateUserRole: (userId: string, role: string) => fetchWithAuth(`/users/${userId}/role`, token, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  deleteUser: (userId: string) => fetchWithAuth(`/users/${userId}`, token, {
    method: 'DELETE',
  }),
}); 