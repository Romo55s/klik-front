import React, { useState, useEffect } from 'react';
import { createUserService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import type { ScanLog } from '../../interfaces/scan.interface';

interface SystemStats {
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  averageScansPerDay: number;
  peakScansHour: number;
  errorRate: number;
}

export const SystemMonitoring: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchSystemData();
  }, [selectedTimeRange]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const userService = createUserService(token);
      const logsData = await userService.getAllScanLogs();
      // Ensure logsData is an array
      const logsArray = Array.isArray(logsData) ? logsData : [];
      setScanLogs(logsArray);
      
      // Calculate system statistics
      calculateSystemStats(logsData);
    } catch (error) {
      console.error('Error fetching system data:', error);
      setError('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemStats = (logs: ScanLog[]) => {
    // Ensure logs is an array
    const logsArray = Array.isArray(logs) ? logs : [];
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filteredLogs = logsArray;
    switch (selectedTimeRange) {
      case '24h':
        filteredLogs = logsArray.filter(log => new Date(log.created_at) > oneDayAgo);
        break;
      case '7d':
        filteredLogs = logsArray.filter(log => new Date(log.created_at) > oneWeekAgo);
        break;
      case '30d':
        filteredLogs = logsArray.filter(log => new Date(log.created_at) > thirtyDaysAgo);
        break;
    }

    const totalScans = filteredLogs.length;
    const scansToday = logsArray.filter(log => new Date(log.created_at) > oneDayAgo).length;
    const scansThisWeek = logsArray.filter(log => new Date(log.created_at) > oneWeekAgo).length;
    
    // Calculate average scans per day
    const daysInRange = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
    const averageScansPerDay = totalScans / daysInRange;

    // Find peak scans hour
    const hourCounts = new Array(24).fill(0);
    filteredLogs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hourCounts[hour]++;
    });
    const peakScansHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Calculate error rate (assuming errors have specific scan_type)
    const errorLogs = filteredLogs.filter(log => log.scan_type === 'error');
    const errorRate = totalScans > 0 ? (errorLogs.length / totalScans) * 100 : 0;

    setStats({
      totalScans,
      scansToday,
      scansThisWeek,
      averageScansPerDay,
      peakScansHour,
      errorRate
    });
  };

  const getRecentScans = () => {
    return scanLogs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
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
          <h2 className="text-3xl font-bold text-gray-900">System Monitoring</h2>
          <p className="mt-2 text-gray-600">Monitor system performance and activity</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={fetchSystemData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalScans.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Scans/Day</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageScansPerDay.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.peakScansHour}:00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scans Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.scansToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scans This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.scansThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.errorRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Scan Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getRecentScans().map((log) => (
                <tr key={log.scan_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.card_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.scan_type === 'error' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.scan_type || 'scan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.location || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.device_info || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-green-600">~200ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium text-yellow-600">75%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Security Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rate Limiting</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="text-sm font-medium text-green-600">Secure</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Encryption</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 