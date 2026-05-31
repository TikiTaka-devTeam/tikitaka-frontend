import AppLogo from "./AppLogo.jsx";
import HeaderActions from "./HeaderActions.jsx";
import "./page-header.css";

function PageHeader({
  unreadCount = 0,
  notifications = [],
  isLoadingNotifications = false,
  notificationError = "",
  onNotificationRead,
  avatarLabel = "\uC0C8\uC2F9",
}) {
  return (
    <header className="page-header">
      <AppLogo className="page-header__logo" />
      <HeaderActions
        unreadCount={unreadCount}
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationError={notificationError}
        onNotificationRead={onNotificationRead}
        avatarLabel={avatarLabel}
      />
    </header>
  );
}

export default PageHeader;
