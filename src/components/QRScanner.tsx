import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrcodeOutlined } from '@ant-design/icons';
import { verifyQrCode } from '../services/qrService';
import { useRateLimit } from '../hooks/useRateLimit';
import { useAuth } from '../contexts/AuthContext';

interface QRScannerProps {
  onScan: (username: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const { userData } = useAuth();
  const { remaining, isLimited, getTimeRemaining, checkLimit } = useRateLimit('QR_SCAN', userData?.user?.user_id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isModalOpen && !scanner) {
      const newScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      newScanner.render(async (decodedText) => {
        try {
          // Check rate limit before processing
          if (!checkLimit()) {
            const timeRemaining = getTimeRemaining();
            setMessage(`Rate limit exceeded. Try again in ${timeRemaining} seconds.`);
            setMessageType('error');
            return;
          }

          setLoading(true);
          setMessage(null);
          setMessageType(null);
          // Use qrService to verify QR code
          const data = await verifyQrCode(decodedText);
          if (data.success) {
            setMessage('QR code verified successfully!');
            setMessageType('success');
            // Extract username from the QR data
            let username = '';
            
            if (data.username) {
              // If the backend returns the username directly
              username = data.username;
            } else {
              // Extract username from the URL if backend doesn't return it
              try {
                const url = new URL(decodedText);
                const pathParts = url.pathname.split('/').filter(part => part.length > 0);
                username = pathParts[pathParts.length - 1]; // Get the last part of the path
              } catch (error) {
                console.error('Error parsing URL:', error);
                setMessage('Invalid QR code format.');
                setMessageType('error');
                return;
              }
            }
            onScan(username); // Pass only the username
            setTimeout(() => {
              setIsModalOpen(false);
              setMessage(null);
              setMessageType(null);
            }, 1500);
          } else {
            setMessage(data.message || 'Verification failed.');
            setMessageType('error');
          }
        } catch (error) {
          setMessage('An error occurred during verification.');
          setMessageType('error');
          console.error('Verification error:', error);
        } finally {
          setLoading(false);
          newScanner.clear();
        }
      }, (error) => {
        // Ignore scanning errors
        console.warn('QR scanning error:', error);
      });

      setScanner(newScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
    };
  }, [isModalOpen, scanner, onScan]);

  const handleOpenScanner = () => {
    setIsModalOpen(true);
  };

  const handleCloseScanner = () => {
    setIsModalOpen(false);
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenScanner}
        disabled={isLimited}
        className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors duration-200 ${
          isLimited 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title={isLimited ? `Rate limited. Try again in ${getTimeRemaining()} seconds.` : 'Scan QR Code'}
      >
        <QrcodeOutlined className="mr-2" />
        Scan QR Code
        {isLimited && <span className="ml-2 text-xs">({remaining})</span>}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border-2 border-blue-500 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
              <button
                onClick={handleCloseScanner}
                className="text-gray-300 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div id="qr-reader" className="w-full bg-black rounded border-2 border-dashed border-blue-400 p-2 mb-4"></div>
            {loading && <div className="text-blue-400 text-center mb-2">Verifying...</div>}
            {message && (
              <div className={`text-center mb-2 ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 