import axios from 'axios';
import type { ScanLog } from '../interfaces/scan.interface';
import { API_BASE_URL } from '../utils/config';

export function createScanService(token: string) {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    async createScanLog(data: { card_id: string; scan_type?: string; location?: string; device_info?: string }): Promise<ScanLog> {
      const response = await api.post('/scans', data);
      return response.data;
    },

    async getScanLogs(): Promise<ScanLog[]> {
      const response = await api.get('/scans');
      return response.data;
    },

    async getScanLog(id: string): Promise<ScanLog> {
      const response = await api.get(`/scans/${id}`);
      return response.data;
    },

    async deleteScanLog(id: string): Promise<void> {
      await api.delete(`/scans/${id}`);
    },

    async getScanLogsByCard(cardId: string): Promise<ScanLog[]> {
      const response = await api.get(`/scans/card/${cardId}`);
      return response.data;
    }
  };
} 