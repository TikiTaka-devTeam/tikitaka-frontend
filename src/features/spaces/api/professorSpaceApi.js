import { apiClient } from "../../../lib/api/client";

export async function createSpaceDocument(spaceId, { title, file }) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("file", file);

  const response = await apiClient.post(
    `/spaces/${spaceId}/documents`,
    formData,
  );

  return response.data;
}
