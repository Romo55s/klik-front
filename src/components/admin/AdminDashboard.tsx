import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserService } from '../../services/userService';
import { createProfileService } from '../../services/profileService';
import { createScanService } from '../../services/scanService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProfiles: number;
  totalCards: number;
  activeCards: number;
  recentScans: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export const AdminDashboard: React.FC = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessToken();
        const userService = createUserService(token);
        const profileService = createProfileService(token);
        const scanService = createScanService(token);
        
        // Fetch all data to calculate stats
        const [users, profiles, scanLogs] = await Promise.all([
          userService.getAllUsers(),
          profileService.getAllProfiles(),
          userService.getAllScanLogs()
        ]);

        // Ensure scanLogs is an array
        const scanLogsArray = Array.isArray(scanLogs) ? scanLogs : [];

        // Calculate statistics
        const totalUsers = users.length;
        const activeUsers = users.filter((user: any) => user.user.role !== 'suspended').length;
        const totalProfiles = profiles.length;
        const totalCards = users.filter((user: any) => user.profile).length;
        const activeCards = users.filter((user: any) => user.profile && user.user.role !== 'suspended').length;
        const recentScans = scanLogsArray.filter(log => {
          const scanDate = new Date(log.created_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return scanDate > oneDayAgo;
        }).length;

        // Determine system health based on various factors
        let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
        if (totalUsers === 0) {
          systemHealth = 'warning';
        } else if (activeUsers / totalUsers < 0.8) {
          systemHealth = 'warning';
        }

        setStats({
          totalUsers,
          activeUsers,
          totalProfiles,
          totalCards,
          activeCards,
          recentScans,
          systemHealth
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [getAccessToken]);

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

  if (!stats) {
    return <div>No data available</div>;
  }

  const StatCard = ({ title, value, icon, color }: { title: string; value: number | undefined; icon: string; color: string }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{(value || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-2 text-gray-600">System statistics and analytics</p>
      </div>

      {/* System Health Status */}
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
        stats.systemHealth === 'healthy' ? 'border-green-500' :
        stats.systemHealth === 'warning' ? 'border-yellow-500' : 'border-red-500'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">
              {stats.systemHealth === 'healthy' ? '🟢' : 
               stats.systemHealth === 'warning' ? '🟡' : '🔴'}
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">System Health</p>
            <p className={`text-lg font-semibold ${
              stats.systemHealth === 'healthy' ? 'text-green-600' :
              stats.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="border-blue-500"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon="✅"
          color="border-green-500"
        />
        <StatCard
          title="Total Profiles"
          value={stats.totalProfiles}
          icon="👤"
          color="border-purple-500"
        />
        <StatCard
          title="Total Cards"
          value={stats.totalCards}
          icon="💳"
          color="border-indigo-500"
        />
        <StatCard
          title="Active Cards"
          value={stats.activeCards}
          icon="🟢"
          color="border-green-500"
        />
        <StatCard
          title="Recent Scans (24h)"
          value={stats.recentScans}
          icon="📱"
          color="border-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/user-management')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>👥</span>
            <span>View All Users</span>
          </button>
          <button 
            onClick={() => navigate('/admin/profile-management')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>👤</span>
            <span>Manage Profiles</span>
          </button>
          <button 
            onClick={() => navigate('/admin/system-monitoring')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>📊</span>
            <span>System Monitoring</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">📊</span>
              <span className="ml-2 text-sm text-gray-700">Dashboard loaded</span>
            </div>
            <span className="text-xs text-gray-500">Just now</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">👥</span>
              <span className="ml-2 text-sm text-gray-700">{stats.totalUsers} users in system</span>
            </div>
            <span className="text-xs text-gray-500">Updated</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">💳</span>
              <span className="ml-2 text-sm text-gray-700">{stats.activeCards} active cards</span>
            </div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 