const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1";

export function getApiUrl(): string {
  return API_BASE_URL;
}

export { API_BASE_URL };
