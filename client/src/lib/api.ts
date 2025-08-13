import { type DocumentOnlyInfo, type OnboardingStatus, type KycOnboarding } from "@shared/schema";

// Use environment variable for API base URL with fallback to relative path
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  details?: any;
  data?: T;
}

export interface CreateOnboardingResponse {
  success: boolean;
  onboarding: KycOnboarding;
  workflowId: string;
}

export interface StatusResponse {
  success: boolean;
  status: OnboardingStatus;
}

export interface DashboardStats {
  total: number;
  verifiedToday: number;
  pendingReview: number;
  processing: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

export interface OnboardingsResponse {
  success: boolean;
  onboardings: KycOnboarding[];
}

export const api = {
  // Create new onboarding session (document-only)
  async createOnboarding(): Promise<CreateOnboardingResponse> {
    const response = await fetch(`${API_BASE}/api/onboarding/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create onboarding");
    }

    return response.json();
  },

  // Upload documents and trigger workflow
  async uploadDocuments(workflowId: string, panFile: File, aadhaarFile: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("panFile", panFile);
    formData.append("aadhaarFile", aadhaarFile);

    const response = await fetch(`${API_BASE}/api/onboarding/${workflowId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload documents");
    }

    return response.json();
  },

  // Get onboarding status
  async getOnboardingStatus(workflowId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE}/api/onboarding/${workflowId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get status");
    }

    return response.json();
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get dashboard stats");
    }

    return response.json();
  },

  // Get all onboardings
  async getOnboardings(status?: string, limit?: number): Promise<OnboardingsResponse> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE}/api/onboardings?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get onboardings");
    }

    return response.json();
  },
};
