import { apiClient } from "../../../lib/api/client";

export const login = (payload) => apiClient.post("/auth/login", payload);

export const signup = (payload) => apiClient.post("/auth/signup", payload);

export const logout = () => apiClient.post("/auth/logout");
