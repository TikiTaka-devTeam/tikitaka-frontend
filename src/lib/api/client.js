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

  // skipAuth가 true인 요청은 Authorization을 붙이지 않음
  if (!config.skipAuth) {
    const accessToken = localStorage.getItem("tikitaka_access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // FormData 요청이면 Content-Type을 직접 지정하지 않아야 함
  // 브라우저가 multipart/form-data; boundary=... 를 자동으로 넣어줌
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});
