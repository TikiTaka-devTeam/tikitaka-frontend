import { apiClient } from "../../../lib/api/client";

export const login = (payload) => apiClient.post("/auth/login", payload);

export const checkEmailDuplicate = (email) => 
    apiClient.get("/auth/check-email", { params: { email }, skipAuth: true });

export const signup = (payload) =>
  apiClient.post("/auth/signup", payload);

export const createProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    "/auth/create-profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    "/auth/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const logout = () => apiClient.post("/auth/logout");
