import { getAuthToken } from "@/shared/services/api.client";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerResponse,
  GetCustomerResponse,
  CustomerListResponse,
} from "../types/customer.types";

const CUSTOMER_API_URL = "http://localhost:3002/api/v1";

const customerApiClient = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = getAuthToken();
    let url = `${CUSTOMER_API_URL}${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

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

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const token = getAuthToken();
    const url = `${CUSTOMER_API_URL}${endpoint}`;

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const token = getAuthToken();
    const url = `${CUSTOMER_API_URL}${endpoint}`;

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

export const customerService = {
  async create(data: CreateCustomerRequest): Promise<CustomerResponse> {
    return customerApiClient.post<CustomerResponse>("/customers", data);
  },

  async getById(id: string): Promise<CustomerResponse> {
    return customerApiClient.get<CustomerResponse>(`/customers/${id}`);
  },

  async getByIdNumber(identification: string): Promise<GetCustomerResponse> {
    return customerApiClient.get<GetCustomerResponse>("/customers/identification", { identification });
  },

  async search(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CustomerListResponse> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    return customerApiClient.get<CustomerListResponse>("/customers", params);
  },

  async update(id: string, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    return customerApiClient.put<CustomerResponse>(`/customers/${id}`, data);
  },
};
