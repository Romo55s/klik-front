import React from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import type { RateLimitType } from '../utils/rateLimiter';

interface RateLimitStatusProps {
  limitType: RateLimitType;
  userId?: string;
  showDetails?: boolean;
}

export const RateLimitStatus: React.FC<RateLimitStatusProps> = ({ 
  limitType, 
  userId, 
  showDetails = false 
}) => {
  const { remaining, isLimited, getTimeRemaining } = useRateLimit(limitType, userId);

  if (!showDetails && !isLimited) {
    return null;
  }

  return (
    <div className={`text-xs ${isLimited ? 'text-red-600' : 'text-gray-500'}`}>
      {isLimited ? (
        <span>
          Rate limited • Try again in {getTimeRemaining()}s
        </span>
      ) : (
        showDetails && (
          <span>
            {remaining} requests remaining
          </span>
        )
      )}
    </div>
  );
}; 