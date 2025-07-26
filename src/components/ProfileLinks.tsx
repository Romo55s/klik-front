import React from 'react';

interface ProfileLinksProps {
  links?: Record<string, string>;
  onRemove?: (name: string) => Promise<void>;
  editable?: boolean;
}

export const ProfileLinks: React.FC<ProfileLinksProps> = ({ links, onRemove, editable = false }) => {
  if (!links || Object.keys(links).length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No portfolio links added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Portfolio Links</h3>
      <div className="grid gap-3">
        {Object.entries(links).map(([name, url]) => (
          <div key={name} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900">{name}</span>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {url}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
                title={`Visit ${name}`}
              >
                Visit
              </a>
              
              {editable && onRemove && (
                <button
                  onClick={() => onRemove(name)}
                  className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors"
                  title={`Remove ${name}`}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 