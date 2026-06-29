import api from './api';
import { Submission } from '@/types/submission';
import { ApiResponse } from '@/types/api';

interface SubmissionListResponse {
    submissions: Submission[];
}

interface SubmissionResponse {
    submission: Submission;
}

export const submissionService = {
    async getTaskSubmissions(taskId: number): Promise<Submission[]> {
        const response = await api.get<ApiResponse<SubmissionListResponse>>(`/submissions/task/${taskId}`);
        return response.data.data.submissions;
    },

    async getMySubmissions(): Promise<Submission[]> {
        const response = await api.get<ApiResponse<SubmissionListResponse>>(`/submissions/my`);
        return response.data.data.submissions;
    },

    async getSubmission(submissionId: number): Promise<Submission> {
        const response = await api.get<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}`);
        return response.data.data.submission;
    },

    async updateSubmission(submissionId: number, status: 'approved' | 'rejected'): Promise<Submission> {
        const response = await api.patch<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}`, { status });
        return response.data.data.submission;
    },
    async createSubmission(taskId: number, data: { submission_content: string; proposed_budget?: string; estimated_delivery_days?: number }): Promise<Submission> {
        const response = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/task/${taskId}`, data);
        return response.data.data.submission;
    },
    async paySubmission(submissionId: number, cardData: { cardHolderName: string; cardNumber: string; expireMonth: string; expireYear: string; cvv: string }): Promise<Submission> {
        const response = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}/pay`, cardData);
        return response.data.data.submission;
    },
    async offerUnpaidSubmission(submissionId: number): Promise<Submission> {
        const response = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}/offer-unpaid`);
        return response.data.data.submission;
    },
    async submitWork(submissionId: number, workLink: string): Promise<Submission> {
        const response = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}/submit-work`, { workLink });
        return response.data.data.submission;
    },
    async respondToOffer(submissionId: number, response: 'accept' | 'reject'): Promise<Submission> {
        const res = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}/offer-response`, { accept: response === 'accept' });
        return res.data.data.submission;
    },
    async verifyGuarantee(token: string): Promise<{ studentName: string; companyName: string; taskTitle: string; completedAt: string; rewardType: string }> {
        const response = await api.get<ApiResponse<any>>(`/submissions/verify-guarantee/${token}`);
        return response.data.data;
    }
};

