import axios from "axios";

// 모든 API 요청이 공통으로 사용하는 axios 인스턴스
// 채린님이 참고하라고 준 우당탕탕 레포에서 axiosInstance.js와 같은 역할,
// baseURL, /api/v1 prefix, 쿠키/토큰 설정처럼 모든 API 호출에 반복되는 설정을 한 곳에서 관리
//
// 우리 프로젝트는 feature-based 구조(기능별로 나눔)이므로 실제 API 함수는 각 feature 안에 
// 예: features/auth/api/auth.api.js -> login(), signup()
// 예: features/dashboard/api/dashboard.api.js -> getRecentSpaces()
//
// feature별 API 파일에서는 이 apiClient를 import한 뒤
// "/auth/login" 같은 endpoint만 넘겨 호출하는 식으로 ~ 해봅시다...
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1`,
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
