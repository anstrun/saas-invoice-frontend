import { apiClient } from "@/shared/services/api.client";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerResponse,
  GetCustomerResponse,
  CustomerListResponse,
} from "../types/customer.types";

export const customerService = {
  async create(data: CreateCustomerRequest): Promise<CustomerResponse> {
    return apiClient.post<CustomerResponse>("/customers", data);
  },

  async getById(id: string): Promise<CustomerResponse> {
    return apiClient.get<CustomerResponse>(`/customers/${id}`);
  },

  async getByIdNumber(identification: string): Promise<GetCustomerResponse> {
    return apiClient.get<GetCustomerResponse>("/customers/identification", { identification });
  },

  async search(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CustomerListResponse> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    return apiClient.get<CustomerListResponse>("/customers", params);
  },

  async update(id: string, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    return apiClient.put<CustomerResponse>(`/customers/${id}`, data);
  },
};
