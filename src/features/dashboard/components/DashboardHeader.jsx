import { useEffect, useState } from "react";
import PageHeader from "../../../components/common/PageHeader.jsx";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../notifications/api/notifications.api.js";

function DashboardHeader({ profile }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      setNotificationError("");

      try {
        const data = await fetchNotifications();

        if (!isMounted) {
          return;
        }

        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) {
          return;
        }

        setNotificationError("알림을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotificationError("");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
    } catch {
      setNotificationError("알림 읽음 처리에 실패했습니다.");
      throw new Error("Failed to mark notification as read.");
    }
  };

  const unreadCount =
    notifications.length > 0 || !isLoadingNotifications
      ? notifications.filter((notification) => !notification.is_read).length
      : profile.unread_notification_count;

  return (
    <PageHeader
      unreadCount={unreadCount}
      notifications={notifications}
      isLoadingNotifications={isLoadingNotifications}
      notificationError={notificationError}
      onNotificationRead={handleNotificationRead}
      avatarSrc={profile.profile_url ?? ""}
      avatarLabel={profile.name}
    />
  );
}

export default DashboardHeader;
