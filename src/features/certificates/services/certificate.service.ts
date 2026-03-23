import { getAuthToken } from "@/shared/services/api.client";
import type {
  CertificateResponse,
  CertificateStatusResponse,
  CertificateListResponse,
} from "../types/certificate.types";

const CERTIFICATES_API_URL = "http://localhost:3002/api/v1";

const certificatesApiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const url = `${CERTIFICATES_API_URL}${endpoint}`;

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

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = getAuthToken();
    const url = `${CERTIFICATES_API_URL}${endpoint}`;

    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

export const certificateService = {
  async upload(file: File, password: string): Promise<CertificateResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    return certificatesApiClient.upload<CertificateResponse>("/certificates/upload", formData);
  },

  async getStatus(): Promise<CertificateStatusResponse> {
    return certificatesApiClient.get<CertificateStatusResponse>("/certificates/status");
  },

  async list(): Promise<CertificateListResponse> {
    return certificatesApiClient.get<CertificateListResponse>("/certificates");
  },
};
