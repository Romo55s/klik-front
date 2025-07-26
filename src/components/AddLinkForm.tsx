import React, { useState } from 'react';

interface AddLinkFormProps {
  onAdd: (name: string, url: string) => Promise<void>;
  onCancel?: () => void;
}

export const AddLinkForm: React.FC<AddLinkFormProps> = ({ onAdd, onCancel }) => {
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!linkName.trim() || !linkUrl.trim()) {
      setError('Both fields are required.');
      return;
    }
    
    if (!validateUrl(linkUrl)) {
      setError('Please enter a valid URL.');
      return;
    }
    
    try {
      setLoading(true);
      await onAdd(linkName.trim(), linkUrl.trim());
      setLinkName('');
      setLinkUrl('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Add Portfolio Link</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="linkName" className="block text-sm font-medium text-gray-700 mb-1">
            Link Name *
          </label>
          <input
            id="linkName"
            type="text"
            placeholder="e.g., LinkedIn, Portfolio, GitHub"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL *
          </label>
          <input
            id="linkUrl"
            type="url"
            placeholder="e.g., https://linkedin.com/in/username"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Adding...' : 'Add Link'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}; 