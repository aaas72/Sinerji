import api from './api';
import { ApiResponse } from '@/types/api';

interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export const uploadService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<UploadResponse>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },
};
