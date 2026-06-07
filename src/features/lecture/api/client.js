// src/api/client.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("tikitaka_access_token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = "API 요청에 실패했습니다.";

    try {
      const errorBody = await response.json();
      errorMessage =
        errorBody.message ||
        errorBody.error ||
        errorBody.detail ||
        errorBody.reason ||
        errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch {
        errorMessage = "API 요청에 실패했습니다.";
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}