import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCardService } from '../services/cardService';
import { useApiCache } from '../hooks/useApiCache';
import { getCardErrorMessage } from '../utils/cardErrorHandler';
import type { Card } from '../interfaces/card.interface';

interface CardManagerProps {
  username: string;
  userId?: string;
}

export const CardManager: React.FC<CardManagerProps> = ({ username, userId }) => {
  const { getAccessToken, isAuthenticated } = useAuth();

  // Cached single card fetcher
  const cardFetcher = useCallback(async () => {
    const token = await getAccessToken();
    const cardService = createCardService(token);
    try {
      return await cardService.getCard();
    } catch (error: any) {
      if (error.message === 'NO_CARD_FOUND') {
        // This is not an error, just means user doesn't have a card yet
        return null;
      }
      throw error; // Re-throw other errors
    }
  }, [getAccessToken]);

  // Use cache hook for single card
  const {
    data: card,
    loading,
    error,
    fetchData: loadCard,
    invalidateCache
  } = useApiCache<Card | null>(`card-${username}`, cardFetcher, {
    cacheTime: 2 * 60 * 1000, // 2 minutes cache
    staleTime: 30 * 1000 // 30 seconds stale time
  });

  useEffect(() => {
    console.log('CardManager: username =', username, 'userId =', userId);
    if (username) {
      loadCard();
    }
  }, [username, userId, loadCard]);



  const handleActivateCard = async (cardId: string) => {
    try {
      const token = await getAccessToken();
      const cardService = createCardService(token);
      await cardService.activateCard(cardId);
      await loadCard(true);
    } catch (error) {
      console.error('Error activating card:', error);
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to activate card';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };



  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center mt-2 text-gray-600">Loading card...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">My Card</h3>
      </div>

      {error && error.message !== 'NO_CARD_FOUND' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.message || 'An error occurred'}
        </div>
      )}



      {!card ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Card Found</h3>
          <p className="text-gray-600 mb-4">You don't have a digital business card yet.</p>
          <p className="text-gray-500 text-sm">Scan a QR code to create your card.</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900">{card.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                card.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : card.status === 'claimed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {card.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{card.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Verified: {card.is_verified ? 'Yes' : 'No'}</span>
              <span>Created: {new Date(card.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex space-x-2">
              {card.status !== 'active' && (
                <button
                  onClick={() => handleActivateCard(card.card_id)}
                  className="flex-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 