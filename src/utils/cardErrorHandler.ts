export interface CardErrorMessage {
  title: string;
  message: string;
  action?: string;
  type: 'info' | 'warning' | 'error';
}

export const getCardErrorMessage = (error: string): CardErrorMessage => {
  switch (error) {
    case 'NO_CARD_FOUND':
      return {
        title: 'No Card Found',
        message: 'You don\'t have a digital business card yet.',
        action: 'Create Your First Card',
        type: 'info' // Not really an error
      };
    case 'CARD_NOT_VERIFIED':
      return {
        title: 'Card Not Verified',
        message: 'Your card needs to be verified before use.',
        action: 'Verify Card',
        type: 'warning'
      };
    case 'CARD_INACTIVE':
      return {
        title: 'Card Inactive',
        message: 'Your card is currently inactive.',
        action: 'Activate Card',
        type: 'warning'
      };
    case 'CARD_ALREADY_EXISTS':
      return {
        title: 'Card Already Exists',
        message: 'You already have a digital business card.',
        action: 'View Card',
        type: 'info'
      };
    default:
      return {
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        action: 'Retry',
        type: 'error'
      };
  }
}; 