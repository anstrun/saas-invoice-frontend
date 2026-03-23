import type { CustomerStatus } from "@/shared/types/api.types";

export interface CreateCustomerRequest {
  identificationType: string;
  identification: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  identificationType?: string;
  identification?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CustomerStatus;
}

export interface Customer {
  id: string;
  identificationType: string;
  identification: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  success: boolean;
  data: {
    success: boolean;
    data?: Customer;
    error?: string;
  };
  timestamp: string;
}

export interface GetCustomerResponse {
  success: boolean;
  data: {
    success: boolean;
    data?: Customer;
    error?: string;
  };
  timestamp: string;
}

export interface CustomerListResponse {
  success: boolean;
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}
