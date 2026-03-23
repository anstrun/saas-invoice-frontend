import { getAuthToken } from "@/shared/services/api.client";
import type { BranchResponse } from "../types/branch.types";

const BRANCHES_API_URL = "http://localhost:3002/api/v1";

const branchesApiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const url = `${BRANCHES_API_URL}${endpoint}`;

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

export const branchService = {
  async getCurrent(): Promise<BranchResponse> {
    return branchesApiClient.get<BranchResponse>("/branches/current");
  },

  async getById(id: string): Promise<BranchResponse> {
    return branchesApiClient.get<BranchResponse>(`/branches/${id}`);
  },
};
