import AppLogo from "./AppLogo.jsx";
import HeaderActions from "./HeaderActions.jsx";
import { useNavigate } from "react-router-dom";
import "./page-header.css";

function PageHeader({
  unreadCount = 0,
  notifications = [],
  isLoadingNotifications = false,
  notificationError = "",
  onNotificationRead,
  avatarSrc = "",
  avatarLabel = "\uC0C8\uC2F9",
}) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <AppLogo className="page-header__logo" />
      <HeaderActions
        unreadCount={unreadCount}
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationError={notificationError}
        onNotificationRead={onNotificationRead}
        avatarSrc={avatarSrc}
        avatarLabel={avatarLabel}
        onProfileClick={() => navigate("/profile-setting")}
      />
    </header>
  );
}

export default PageHeader;
