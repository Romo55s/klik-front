/**
 * Utility functions for user data operations
 */

/**
 * Gets the username from userData object
 * @param userData The user data object from AuthContext
 * @returns The username or empty string if not available
 */
export function getUsernameFromUserData(userData: any): string {
  if (!userData) return '';
  
  // Try different possible locations for username
  return userData.user?.username || 
         userData.profile?.username || 
         userData.username || 
         '';
}

/**
 * Gets the display name from userData object
 * @param userData The user data object from AuthContext
 * @returns The display name or empty string if not available
 */
export function getDisplayNameFromUserData(userData: any): string {
  if (!userData) return '';
  
  // Try different possible locations for name
  return userData.user?.name || 
         userData.profile?.name || 
         userData.name || 
         '';
}

/**
 * Gets the email from userData object
 * @param userData The user data object from AuthContext
 * @returns The email or empty string if not available
 */
export function getEmailFromUserData(userData: any): string {
  if (!userData) return '';
  
  // Try different possible locations for email
  return userData.user?.email || 
         userData.profile?.email || 
         userData.email || 
         '';
}

/**
 * Gets the avatar URL from userData object
 * @param userData The user data object from AuthContext
 * @returns The avatar URL or empty string if not available
 */
export function getAvatarUrlFromUserData(userData: any): string {
  if (!userData) return '';
  
  // Try different possible locations for avatar
  return userData.user?.avatar_url || 
         userData.user?.picture || 
         userData.profile?.avatar_url || 
         userData.avatar_url || 
         '';
} 