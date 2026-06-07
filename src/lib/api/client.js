import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }

  if (!config.skipAuth) {
    const accessToken = localStorage.getItem("tikitaka_access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});