
import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") ||
  "http://localhost:8080";

const apiBaseUrl = rawApiUrl.endsWith("/api/v1")
  ? rawApiUrl
  : `${rawApiUrl}/api/v1`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
