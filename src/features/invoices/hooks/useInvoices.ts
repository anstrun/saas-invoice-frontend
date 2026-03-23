import { useQuery, useMutation } from "@tanstack/react-query";
import { invoiceService } from "../services/invoice.service";
import type { FacturaRequest, FacturaResponse } from "../types/invoice.types";

const INVOICES_KEY = ["invoices"];

export const useInvoice = (accessKey: string) => {
  return useQuery({
    queryKey: [...INVOICES_KEY, accessKey],
    queryFn: () => invoiceService.getByAccessKey(accessKey),
    enabled: !!accessKey,
  });
};

export const useInvoices = (branchId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: [...INVOICES_KEY, branchId, page, limit],
    queryFn: () => invoiceService.list(branchId, page, limit),
    enabled: !!branchId,
  });
};

export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: (data: FacturaRequest) => invoiceService.create(data),
    onSuccess: () => {
      // Optionally invalidate invoices list
    },
  });
};
