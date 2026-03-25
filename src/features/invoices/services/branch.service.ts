import { apiClient } from "@/shared/services/api.client";
import type { BranchResponse } from "../types/branch.types";

export const branchService = {
  async getCurrent(): Promise<BranchResponse> {
    return apiClient.get<BranchResponse>("/branches/current");
  },

  async getById(id: string): Promise<BranchResponse> {
    return apiClient.get<BranchResponse>(`/branches/${id}`);
  },
};
