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
    }
  };
} 