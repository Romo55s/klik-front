import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrcodeOutlined } from '@ant-design/icons';

interface QRScannerProps {
  onScan: (username: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

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

      newScanner.render((decodedText) => {
        try {
          // Extract username from the decoded URL
          const url = new URL(decodedText);
          const pathParts = url.pathname.split('/');
          const username = pathParts[pathParts.length - 1];
          if (username) {
            onScan(username);
            setIsModalOpen(false);
            newScanner.clear();
          }
        } catch (error) {
          console.error('Invalid QR code:', error);
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
        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
      >
        <QrcodeOutlined className="mr-2" />
        Scan QR Code
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
              <button
                onClick={handleCloseScanner}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div id="qr-reader" className="w-full"></div>
          </div>
        </div>
      )}
    </>
  );
}; 