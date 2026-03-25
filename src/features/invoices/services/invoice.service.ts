import { apiClient } from "@/shared/services/api.client";
import type {
  FacturaRequest,
  FacturaResponse,
  InvoiceResponse,
  InvoiceListResponse,
} from "../types/invoice.types";

export const invoiceService = {
  async create(data: FacturaRequest): Promise<FacturaResponse> {
    return apiClient.post<FacturaResponse>("/invoices", data);
  },

  async getByAccessKey(accessKey: string): Promise<InvoiceResponse> {
    return apiClient.get<InvoiceResponse>(`/invoices/${accessKey}`);
  },

  async list(branchId: string, page: number = 1, limit: number = 20): Promise<InvoiceListResponse> {
    return apiClient.get<InvoiceListResponse>("/invoices", {
      branchId,
      page: String(page),
      limit: String(limit),
    });
  },
};

export const createInvoice = invoiceService.create;
