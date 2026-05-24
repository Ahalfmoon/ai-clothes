/* 前后端共享的类型写在这里 */

export interface HistoryRecord {
  id: string;
  originalPhotoUrl: string;
  clothingPhotoUrl: string;
  resultPhotoUrl: string | null;
  styleSuggestion: string | null;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface CreateHistoryRequest {
  originalPhotoUrl: string;
  clothingPhotoUrl: string;
  resultPhotoUrl: string;
  styleSuggestion: string;
  status: 'success' | 'failed';
}

export interface HistoryListResponse {
  items: HistoryRecord[];
  total: number;
}

export interface DeleteHistoryResponse {
  success: boolean;
}
