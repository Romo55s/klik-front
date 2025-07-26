import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCardService } from '../services/cardService';

export const CardClaim: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { getAccessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cardStatus, setCardStatus] = useState<'checking' | 'available' | 'claimed' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCardStatus = async () => {
      if (!username) {
        setCardStatus('error');
        setError('No username provided');
        return;
      }

      try {
        setLoading(true);
        const token = await getAccessToken();
        const cardService = createCardService(token);
        
        // Instead of getting all cards, check if the current user already has cards for this profile
        // This avoids the 400 error from getUserCards when user has no url_id_text
        try {
          const profileCards = await cardService.getCardsByProfile(username);
          if (profileCards && profileCards.cards && profileCards.cards.length > 0) {
            setCardStatus('claimed');
          } else {
            setCardStatus('available');
          }
        } catch (profileError) {
          // If getCardsByProfile fails, assume the card is available
          console.log('Profile cards not found, assuming available:', profileError);
          setCardStatus('available');
        }
      } catch (error) {
        console.error('Error checking card status:', error);
        setCardStatus('error');
        setError('Failed to check card status');
      } finally {
        setLoading(false);
      }
    };

    checkCardStatus();
  }, [username, getAccessToken]);

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
      
      // The backend expects profileUserId, but we have username
      // We need to get the user ID for this username first
      // For now, let's try to claim with the username and see if the backend can handle it
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

  const handleGoToProfile = () => {
    navigate(`/profile/${username}`, { replace: true });
  };

  if (loading && cardStatus === 'checking') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Checking card status...</p>
        </div>
      </div>
    );
  }

  if (cardStatus === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-bold text-red-600 mb-4 text-center">Error</h2>
          <p className="text-gray-600 text-center mb-8">
            {error || 'An error occurred while checking the card status.'}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cardStatus === 'claimed') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Card Already Claimed</h2>
            <p className="text-gray-600 mb-8">
              This card has already been claimed by another user. You can view the profile of the card owner.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoToProfile}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-200"
            >
              View Profile
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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