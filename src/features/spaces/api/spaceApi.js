import { apiClient } from "../../../lib/api/client";

export async function getMySpaces() {
  const response = await apiClient.get("/spaces");
  return response.data;
}

export async function getSpaceDocuments(spaceId) {
  const response = await apiClient.get(`/spaces/${spaceId}/documents`);
  return response.data;
}

export async function getDocumentSlides(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/slides`);
  return response.data;
}
