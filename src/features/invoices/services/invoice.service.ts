import { getAuthToken } from "@/shared/services/api.client";
import type {
  FacturaRequest,
  FacturaResponse,
  InvoiceResponse,
  InvoiceListResponse,
} from "../types/invoice.types";

const INVOICE_API_URL = "http://localhost:3002/api/v1";

const invoiceApiClient = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = getAuthToken();
    let url = `${INVOICE_API_URL}${endpoint}`;

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
    const url = `${INVOICE_API_URL}${endpoint}`;

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
};

export const invoiceService = {
  async create(data: FacturaRequest): Promise<FacturaResponse> {
    return invoiceApiClient.post<FacturaResponse>("/invoices", data);
  },

  async getByAccessKey(accessKey: string): Promise<InvoiceResponse> {
    return invoiceApiClient.get<InvoiceResponse>(`/invoices/${accessKey}`);
  },

  async list(branchId: string, page: number = 1, limit: number = 20): Promise<InvoiceListResponse> {
    return invoiceApiClient.get<InvoiceListResponse>("/invoices", {
      branchId,
      page: String(page),
      limit: String(limit),
    });
  },
};

export const createInvoice = invoiceService.create;
