import { apiClient } from "../../../lib/api/client.js";

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

export async function getSpaceCode(spaceId) {
  const response = await apiClient.get(`/spaces/${spaceId}/code`);
  return response.data;
}

export async function getSpaceMembers(spaceId) {
  const response = await apiClient.get(
    `/spaces/${spaceId}/members?validity=APPROVED`,
  );

  return response.data;
}

export async function getPendingSpaceMembers(spaceId) {
  const response = await apiClient.get(
    `/spaces/${spaceId}/members?validity=PENDING`,
  );

  return response.data;
}

export async function approveSpaceMember(spaceId, memberId) {
  const response = await apiClient.patch(
    `/spaces/${spaceId}/members/${memberId}/approve`,
  );

  return response.data;
}

export async function denySpaceMember(spaceId, memberId) {
  const response = await apiClient.patch(
    `/spaces/${spaceId}/members/${memberId}/deny`,
  );

  return response.data;
}
