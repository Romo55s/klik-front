import React, { useState, useEffect } from 'react';
import { createCardService } from '../../services/cardService';
import { createAdminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import type { Card } from '../../interfaces/card.interface';

export const CardManagement: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const cardService = createCardService(token);
      
      const cardsData = await cardService.getAllCards();
      console.log(cardsData);
      // Ensure cardsData is an array
      const cardsArray = Array.isArray(cardsData) ? cardsData : [];
      setCards(cardsArray);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCardStatus = async (cardId: string, isActive: boolean) => {
    try {
      const token = await getAccessToken();
      const adminService = createAdminService(token);
      
      await adminService.toggleCardStatus(cardId, isActive);
      
      // Update local state
      setCards(cards.map(card => 
        card.card_id === cardId 
          ? { ...card, status: !isActive ? 'active' : 'inactive' }
          : card
      ));

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = `Card ${isActive ? 'deactivated' : 'activated'} successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error toggling card status:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to update card status';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  // Filter cards based on search term and status filter
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && card.status === 'active') ||
                         (filterStatus === 'inactive' && card.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

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
          <h2 className="text-3xl font-bold text-gray-900">Card Management</h2>
          <p className="mt-2 text-gray-600">Manage all business cards in the system</p>
        </div>
        <button
          onClick={fetchCards}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="card-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Cards
            </label>
            <input
              type="text"
              id="card-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div key={card.card_id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                card.status === 'active'
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {card.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {card.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{card.description}</p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Card ID:</span>
                <span className="font-mono text-xs">{card.card_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono text-xs">{card.user_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">
                  {new Date(card.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Updated:</span>
                <span className="font-medium">
                  {new Date(card.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleToggleCardStatus(card.card_id, card.status === 'active')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  card.status === 'active'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {card.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cards found matching your search.</p>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
            <div className="text-sm text-gray-600">Total Cards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(card => card.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Cards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {cards.filter(card => card.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-600">Inactive Cards</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 