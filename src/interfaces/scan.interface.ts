export interface ScanLog {
  scan_id: string;
  user_id: string;
  card_id: string;
  scan_type: string;
  location: string | null;
  device_info: string | null;
  created_at: string;
} 