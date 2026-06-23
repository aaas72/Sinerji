import api from './api';
import { StudentProfile, UpdateProfileData } from '@/types/student';
import { ApiResponse } from '@/types/api';

interface ProfileData {
  profile: StudentProfile;
}

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

interface StatsData {
  stats: StudentStats;
}

export const studentService = {
  async getAllStudents(): Promise<StudentProfile[]> {
    // Falls back to empty array if the endpoint is not yet implemented on backend
    const response = await api.get<ApiResponse<{ students: StudentProfile[] }>>('/students').catch(() => ({ data: { data: { students: [] } } }));
    return response.data?.data?.students || [];
  },

  async getStudentById(id: number): Promise<StudentProfile> {
    const response = await api.get<ApiResponse<ProfileData>>(`/students/${id}`);
    return response.data.data.profile;
  },

  async getProfile(): Promise<StudentProfile> {
    const response = await api.get<ApiResponse<ProfileData>>('/students/me');
    return response.data.data.profile;
  },

  async updateProfile(data: UpdateProfileData): Promise<StudentProfile> {
    const response = await api.patch<ApiResponse<ProfileData>>('/students/me', data);
    return response.data.data.profile;
  },

  async addSkill(skillName: string, category: string, level: number): Promise<StudentProfile> {
    const response = await api.post<ApiResponse<ProfileData>>('/students/skills', { skillName, category, level });
    return response.data.data.profile;
  },

  async removeSkill(skillId: number): Promise<StudentProfile> {
    const response = await api.delete<ApiResponse<ProfileData>>(`/students/skills/${skillId}`);
    return response.data.data.profile;
  },

  async getMyStats(): Promise<StudentStats> {
    const response = await api.get<ApiResponse<StatsData>>('/students/me/stats');
    return response.data.data.stats;
  },

  async getSavedTasks(): Promise<any[]> {
    const response = await api.get<ApiResponse<{ tasks: any[] }>>('/students/saved-tasks');
    return response.data.data.tasks;
  },

  async saveTask(taskId: number): Promise<void> {
    await api.post(`/students/tasks/${taskId}/save`);
  },

  async unsaveTask(taskId: number): Promise<void> {
    await api.delete(`/students/tasks/${taskId}/save`);
  },

  async verifyDocument(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await api.post<ApiResponse<any>>(
      '/students/verify-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      message: response.data.message || 'Öğrenci belgeniz başarıyla yüklendi. İşlem arka planda yürütülüyor.',
    };
  },

  async registerBankDetails(data: { name: string; surname: string; email: string; gsmNumber: string; identityNumber: string; iban: string; address: string }): Promise<StudentProfile> {
    const response = await api.post<ApiResponse<ProfileData>>('/students/bank-setup', data);
    return response.data.data.profile;
  },

  async sendUniversityEmailVerification(email: string): Promise<{ success: boolean; message: string; code?: string }> {
    const response = await api.post<ApiResponse<{ code?: string }>>('/students/verify-university-email/send', { email });
    return {
      success: response.data.status === 'success',
      message: response.data.message || 'Doğrulama kodu e-postanıza gönderildi.',
      code: response.data.data?.code,
    };
  },

  async verifyUniversityEmail(code: string): Promise<StudentProfile> {
    const response = await api.post<ApiResponse<ProfileData>>('/students/verify-university-email/confirm', { code });
    return response.data.data.profile;
  }
};

