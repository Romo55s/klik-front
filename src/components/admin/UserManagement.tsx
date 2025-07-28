import React, { useState, useEffect } from 'react';
import { createUserService } from '../../services/userService';
import { createAdminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import type { UserWithProfile } from '../../services/userService';

export const UserManagement: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const userService = createUserService(token);
      const usersData = await userService.getAllUsers();
      // Fetch all profiles and attach the avatar_url to the corresponding user in usersData
      const profilesData = await userService.getAllProfiles();
      if (Array.isArray(usersData) && Array.isArray(profilesData)) {
        usersData.forEach((userObj: any) => {
          const profile = profilesData.find((p: any) => p.user_id === userObj.user.user_id);
          if (profile) {
            userObj.profile = profile;
          } else {
            userObj.profile = {};
          }
        });
      }
      // Ensure usersData is an array
      const usersArray = Array.isArray(usersData) ? usersData : [];
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'suspended') => {
    try {
      const token = await getAccessToken();
      const adminService = createAdminService(token);
      await adminService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.user.user_id === userId 
          ? { ...user, user: { ...user.user, role: newRole } }
          : user
      ));

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'User role updated successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to update user role';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getAccessToken();
      const userService = createUserService(token);
      await userService.deleteUser(userId);
      
      // Remove from local state
      setUsers(users.filter(user => user.user.user_id !== userId));

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'User deleted successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to delete user';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="mt-2 text-gray-600">Manage all users in the system</p>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={(() => {
                            const imageUrl = user.user.picture || user.profile.avatar_url || '/default-avatar.png';
                            return imageUrl;
                          })()}
                          alt=""
                          onError={(e) => {
                            console.log('Image failed to load for user:', user.user.name, 'falling back to default');
                            e.currentTarget.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.user.role || 'user')}`}>
                      {user.user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.user.role === 'suspended' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.user.role === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <select
                        value={user.user.role || 'user'}
                        onChange={(e) => handleUpdateUserRole(user.user.user_id, e.target.value as any)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.user.user_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full"
                  src={selectedUser.user.picture || selectedUser.profile?.avatar_url || '/default-avatar.png'}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedUser.user.name}</h4>
                  <p className="text-gray-600">{selectedUser.user.email}</p>
                  <p className="text-gray-500">@{selectedUser.user.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="text-sm text-gray-900">{selectedUser.user.role || 'user'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.user.role === 'suspended' ? 'Suspended' : 'Active'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.user.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.user.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedUser.user.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-900">{selectedUser.user.bio}</p>
                </div>
              )}
              
              {selectedUser.profile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Links</label>
                  <div className="mt-2 space-y-2">
                    {selectedUser.profile.links && Array.isArray(selectedUser.profile.links) ? (
                      // Handle array format with key/value structure
                      selectedUser.profile.links.map((link: any, index: number) => {
                        const linkName = link.key || link.name || `Link ${index + 1}`;
                        const linkUrl = link.value || link.url || '#';
                        
                        return (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{linkName}</span>
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {linkUrl}
                            </a>
                          </div>
                        );
                      })
                    ) : selectedUser.profile.links && typeof selectedUser.profile.links === 'object' ? (
                      // Handle object format
                      Object.entries(selectedUser.profile.links).map(([name, url]) => (
                        <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{name}</span>
                          <a
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {url as string}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No links found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 