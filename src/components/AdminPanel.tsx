import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserManagement } from './admin/UserManagement';
import { ProfileManagement } from './admin/ProfileManagement';
import { CardManagement } from './admin/CardManagement';
import { SystemMonitoring } from './admin/SystemMonitoring';

type AdminTab = 'dashboard' | 'users' | 'profiles' | 'cards' | 'monitoring';

interface AdminPanelProps {
  defaultTab?: AdminTab;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ defaultTab = 'dashboard' }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>(defaultTab);

  // Update active tab when location changes
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/admin/user-management')) setActiveTab('users');
    else if (path.includes('/admin/profile-management')) setActiveTab('profiles');
    else if (path.includes('/admin/card-management')) setActiveTab('cards');
    else if (path.includes('/admin/system-monitoring')) setActiveTab('monitoring');
  }, [location.pathname]);

  // Check if user is admin
  if (userData?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'profiles', label: 'Profile Management', icon: '👤' },
    { id: 'cards', label: 'Card Management', icon: '💳' },
    { id: 'monitoring', label: 'System Monitoring', icon: '🔍' }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'profiles':
        return <ProfileManagement />;
      case 'cards':
        return <CardManagement />;
      case 'monitoring':
        return <SystemMonitoring />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {userData?.user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const routes = {
                    dashboard: '/admin/dashboard',
                    users: '/admin/user-management',
                    profiles: '/admin/profile-management',
                    cards: '/admin/card-management',
                    monitoring: '/admin/system-monitoring'
                  };
                  navigate(routes[tab.id]);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}; 