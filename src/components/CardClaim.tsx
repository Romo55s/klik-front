import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCardService } from '../services/cardService';

export const CardClaim: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { getAccessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClaimCard = async () => {
    if (!isAuthenticated || !username) {
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      toast.textContent = 'Authentication required';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessToken();
      const cardService = createCardService(token);
      await cardService.claimCard(username);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      toast.textContent = 'Card claimed successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error claiming card:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      toast.textContent = 'Failed to claim card. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Claim Your Card</h2>
        <p className="text-gray-600 text-center mb-8">
          You've scanned a QR code for a physical card. Click the button below to claim this card and activate it.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleClaimCard}
            disabled={loading}
            className={`
              px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-sm
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming...
              </div>
            ) : (
              'Claim Card'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 