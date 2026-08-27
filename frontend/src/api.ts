import axios from 'axios';
import { Job, PaginatedResponse } from './types';

const API_BASE_URL = '/api/jobs'; 

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const jobService = {
  // Pass current page indexes to handle pagination requests
  async getAllJobs(page: number = 0, size: number = 10): Promise<PaginatedResponse> {
    const response = await axios.get<PaginatedResponse>(`${API_BASE_URL}?page=${page}&size=${size}`);
    return response.data;
  },

  async addJob(jobData: Omit<Job, 'id' | 'status' | 'appliedDate'>): Promise<Job> {
    // Sending data straight up without dates; Spring Boot appends LocalDate.now() automatically
    const response = await axios.post<Job>(API_BASE_URL, jobData);
    return response.data;
  },

  async updateJob(id: number, jobData: Omit<Job, 'id' | 'status' | 'appliedDate'>): Promise<Job> {
    const response = await axios.put<Job>(`${API_BASE_URL}/${id}`, jobData);
    return response.data;
  },

  async updateJobStatus(id: number, status: Job['status']): Promise<Job> {
    const response = await axios.put<Job>(`${API_BASE_URL}/${id}/status`, { 
      status: status 
    });
    return response.data;
  },

  async deleteJob(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  async getExtendedAnalytics(): Promise<{ companyCounts: any[], dailyCounts: any[] }> {
    const response = await axios.get(`${API_BASE_URL}/analytics`);
    return response.data;
  },

  async exportPipelineData(): Promise<void> {
    window.open('/api/jobs/export?token=' + localStorage.getItem('token'), '_blank');
  },

  async importPipelineFile(file: File): Promise<{ successCount: number, skippedDuplicates: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('/api/jobs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
