import { getApiUrl } from "@/shared/config/api.config";

const DEBUG = import.meta.env.MODE === "development";

type QueuedRequest = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueuedRequest[] = [];
let tokenRefreshRequested = false;

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("_at");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("_rt");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("_at", token);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem("_rt", token);
};

export const clearTokens = (): void => {
  localStorage.removeItem("_at");
  localStorage.removeItem("_rt");
};

const requestTokenRefresh = (): void => {
  if (tokenRefreshRequested) return;
  tokenRefreshRequested = true;
  console.log("Requesting token refresh from parent...");
  window.parent.postMessage({ type: "REQUEST_TOKEN_REFRESH" }, "*");
};

const processQueue = (success: boolean, newToken?: string): void => {
  if (newToken) {
    refreshQueue.forEach((q) => q.resolve());
  } else {
    refreshQueue.forEach((q) => q.reject(new Error("Token refresh failed")));
  }
  refreshQueue = [];
};

if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    if (event.data?.type === "AUTH_DATA" && event.data.token) {
      console.log("New token received via postMessage:", event.data.token);
      setAuthToken(event.data.token);
      tokenRefreshRequested = false;
      processQueue(true, event.data.token);
      
    }
  });
}

const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = `${getApiUrl()}${endpoint}`;
  if (!params || Object.keys(params).length === 0) return url;

  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
};

const getHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function fetchWithAuth<T>(
  method: string,
  url: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  const token = getAuthToken();
  if (DEBUG) console.log(`${method} ${url}`, body);

  const headers = getHeaders(token);
  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    requestTokenRefresh();

    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: async () => {
          try {
            const result = await fetchWithAuth<T>(method, url, body, params);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        },
        reject,
      });
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = buildUrl(endpoint, params);
    return fetchWithAuth<T>("GET", url);
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${getApiUrl()}${endpoint}`;
    return fetchWithAuth<T>("POST", url, body);
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${getApiUrl()}${endpoint}`;
    return fetchWithAuth<T>("PUT", url, body);
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${getApiUrl()}${endpoint}`;
    const token = getAuthToken();

    if (DEBUG) console.log(`UPLOAD ${url}`);

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (response.status === 401) {
      requestTokenRefresh();
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: async () => {
            try {
              const result = await apiClient.upload<T>(endpoint, formData);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          },
          reject,
        });
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
};
