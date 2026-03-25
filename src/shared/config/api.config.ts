const API_BASE_URL = import.meta.env.VITE_API_URL || "http://be1-env.eba-uni2bp5w.us-east-2.elasticbeanstalk.com/api/v1";

export function getApiUrl(): string {
  return API_BASE_URL;
}

export { API_BASE_URL };
