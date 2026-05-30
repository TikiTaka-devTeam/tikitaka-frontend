import axios from "axios";

// Shared axios instance for every API request.
// Put only the server origin in VITE_API_BASE_URL.
// Example: VITE_API_BASE_URL=https://api.example.com
// The /api/v1 prefix is added here so feature API files can call paths like /auth/login.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("tikitaka_access_token");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
