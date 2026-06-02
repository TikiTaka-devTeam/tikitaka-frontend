import { apiClient } from "../../../lib/api/client";

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
