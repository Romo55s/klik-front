import axios from 'axios';
import type { Card, CreateCardDto, UpdateCardDto } from '../interfaces/card.interface';

export function createCardService(token: string) {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
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

    async getCards(): Promise<Card[]> {
      const response = await api.get('/cards');
      return response.data;
    },

    async getCard(id: string): Promise<Card> {
      const response = await api.get(`/cards/${id}`);
      return response.data;
    },

    async getCardsByProfile(profileUsername: string): Promise<any> {
      const response = await api.get(`/cards/profile/${profileUsername}`);
      return response.data;
    },

    async activateCard(cardId: string): Promise<Card> {
      const response = await api.post(`/cards/${cardId}/activate`);
      return response.data;
    },

    async deactivateCard(cardId: string): Promise<Card> {
      const response = await api.post(`/cards/${cardId}/deactivate`);
      return response.data;
    },

    async claimCard(profileUserId: string): Promise<Card> {
      const response = await api.post('/cards/claim', { profileUserId });
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