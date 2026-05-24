import axios from 'axios';
import type { CreateHistoryRequest, HistoryListResponse, DeleteHistoryResponse } from "@shared/api.interface";

// Create axios instance for API requests
const axiosForBackend = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add more API functions here, use axios instance (`axiosForBackend`) to make requests.

export async function createHistory(data: CreateHistoryRequest) {
  const response = await axiosForBackend.post<{ id: string }>(
    "/history",
    data
  );
  return response.data;
}

export async function getHistoryList(page = 1, pageSize = 20) {
  const response = await axiosForBackend.get<HistoryListResponse>(
    `/history?page=${page}&pageSize=${pageSize}`
  );
  return response.data;
}

export async function deleteHistory(id: string) {
  const response = await axiosForBackend.delete<DeleteHistoryResponse>(
    `/history/${id}`
  );
  return response.data;
}
