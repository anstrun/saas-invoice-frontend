import { apiClient } from "@/shared/services/api.client";
import type {
  CertificateResponse,
  CertificateStatusResponse,
  CertificateListResponse,
} from "../types/certificate.types";

export const certificateService = {
  async upload(file: File, password: string): Promise<CertificateResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  const response = await apiClient.upload<CertificateResponse>("/certificates/upload", formData);
  if (!response.success) {
    throw new Error(response.error || "Error al subir el certificado");
  }
  return response;
},

  async getStatus(): Promise<CertificateStatusResponse> {
    return apiClient.get<CertificateStatusResponse>("/certificates/status");
  },

  async list(): Promise<CertificateListResponse> {
    return apiClient.get<CertificateListResponse>("/certificates");
  },
};
