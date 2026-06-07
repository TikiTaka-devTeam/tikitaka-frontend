import { apiClient } from "../../../lib/api/client.js";
import {
  getMockNotifications,
  getMockNotificationTarget,
  patchMockNotificationRead,
} from "../mocks/notifications.mock.js";

const useNotificationsMock = import.meta.env.VITE_USE_NOTIFICATIONS_MOCK !== "false";

export async function fetchNotifications({ isRead } = {}) {
  if (useNotificationsMock) {
    return getMockNotifications({ isRead });
  }

  const params = typeof isRead === "boolean" ? { is_read: isRead } : undefined;
  const { data } = await apiClient.get("/notifications", { params });

  return data;
}

export async function markNotificationAsRead(notificationId) {
  if (useNotificationsMock) {
    return patchMockNotificationRead(notificationId);
  }

  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);

  return data;
}

export async function fetchNotificationTarget(notificationId) {
  if (useNotificationsMock) {
    return getMockNotificationTarget(notificationId);
  }

  const { data } = await apiClient.get(`/notifications/${notificationId}/target`);

  return data;
}
