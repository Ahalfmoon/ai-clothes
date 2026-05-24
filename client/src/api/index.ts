import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { CreateHistoryRequest, HistoryListResponse, DeleteHistoryResponse } from "@shared/api.interface";


// Add more API functions here, use axios instance (`axiosForBackend`) to make requests.

export async function createHistory(data: CreateHistoryRequest) {
  const response = await axiosForBackend.post<{ id: string }>(
    "/api/history",
    data
  );
  return response.data;
}

export async function getHistoryList(page = 1, pageSize = 20) {
  const response = await axiosForBackend.get<HistoryListResponse>(
    `/api/history?page=${page}&pageSize=${pageSize}`
  );
  return response.data;
}

export async function deleteHistory(id: string) {
  const response = await axiosForBackend.delete<DeleteHistoryResponse>(
    `/api/history/${id}`
  );
  return response.data;
}
