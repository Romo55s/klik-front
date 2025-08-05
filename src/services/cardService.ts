import axios from 'axios';
import type { Card, CreateCardDto, UpdateCardDto } from '../interfaces/card.interface';
import { API_BASE_URL } from '../utils/config';

export function createCardService(token: string) {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    async createCard(data: CreateCardDto): Promise<Card> {
      const response = await api.post('/cards', data);
      return response.data;
    },

    async getCard(): Promise<Card> {
      try {
        const response = await api.get('/cards');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User doesn't have a card yet - this is normal
          throw new Error('NO_CARD_FOUND');
        }
        throw error; // Re-throw other errors
      }
    },

    async activateCard(cardId: string): Promise<Card> {
      const response = await api.post(`/cards/${cardId}/activate`);
      return response.data;
    },

    async updateCard(id: string, data: { name?: string; description?: string }): Promise<Card> {
      const response = await api.put(`/cards/${id}`, data);
      return response.data;
    },

    async deleteCard(id: string): Promise<void> {
      await api.delete(`/cards/${id}`);
    },

    // Get card by username (for checking card status)
    async getCardByUsername(username: string): Promise<{ card: Card; user: any }> {
      try {
        const response = await api.get(`/cards/username/${username}`);
        
        // Validate response structure
        if (response.data && response.data.card) {
          return response.data;
        } else {
          console.error('🌐 API: Invalid response structure - missing card property');
          throw new Error('INVALID_RESPONSE');
        }
      } catch (error: any) {
        console.error('🌐 API: Error in getCardByUsername:', error);
        if (error.response?.status === 404) {
          throw new Error('NO_CARD_FOUND');
        }
        if (error.message === 'INVALID_RESPONSE') {
          throw error;
        }
        throw new Error('API_ERROR');
      }
    },

    // Get public card status by username (no authentication required)
    async getPublicCardStatus(username: string): Promise<{ status: 'active' | 'inactive' | 'not_found' }> {
      const publicApi = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      try {
        const response = await publicApi.get(`/cards/public/${username}/status`);
        
        // Handle different response formats
        if (response.data && typeof response.data.status === 'string') {
          return response.data;
        } else if (response.data && response.data.card && response.data.card.status) {
          // If backend returns full card object, extract status
          return { status: response.data.card.status };
        } else {
          return { status: 'not_found' };
        }
      } catch (error: any) {
        console.error('🌐 API: Error in getPublicCardStatus:', error);
        if (error.response?.status === 404) {
          return { status: 'not_found' };
        }
        return { status: 'not_found' };
      }
    },

    // Admin methods
    async getAllCards(): Promise<Card[]> {
      const response = await api.get('/admin/cards');
      // Handle different response structures: {cards: [...]}, {data: [...]}, or [...]
      return response.data.cards || response.data.data || response.data;
    }
  };
} 