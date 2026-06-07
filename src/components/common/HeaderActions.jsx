import { useEffect, useRef, useState } from "react";
import NotificationPopover from "./NotificationPopover.jsx";
import "./header-actions.css";

function BellIcon() {
  return (
    <svg
      className="header-actions__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 4.75C9.37665 4.75 7.25 6.87665 7.25 9.5V11.7942C7.25 12.2817 7.06616 12.7513 6.73518 13.1091L5.71776 14.2081C4.86141 15.1332 5.5173 16.625 6.77741 16.625H17.2226C18.4827 16.625 19.1386 15.1332 18.2822 14.2081L17.2648 13.1091C16.9338 12.7513 16.75 12.2817 16.75 11.7942V9.5C16.75 6.87665 14.6234 4.75 12 4.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.25 19.125C10.672 19.7463 11.2854 20.125 12 20.125C12.7146 20.125 13.328 19.7463 13.75 19.125"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeaderActions({
  unreadCount = 0,
  notifications = [],
  isLoadingNotifications = false,
  notificationError = "",
  onNotificationRead,
  avatarSrc = "",
  avatarLabel = "\uC0C8\uC2F9",
  notificationLabel = "\uC54C\uB9BC",
  profileLabel = "\uD504\uB85C\uD544",
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const notificationAreaRef = useRef(null);

  useEffect(() => {
    setHasAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (notificationAreaRef.current?.contains(event.target)) {
        return;
      }

      setIsNotificationOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read && onNotificationRead) {
      try {
        await onNotificationRead(notification.notification_id);
      } catch {
        return;
      }
    }
  };

  const avatarText = avatarLabel.trim().charAt(0) || "\uC0C8";
  const hasAvatarImage = Boolean(avatarSrc?.trim()) && !hasAvatarError;

  return (
    <div className="header-actions">
      <div className="header-actions__notifications" ref={notificationAreaRef}>
        <button
          type="button"
          className={`header-actions__button${isNotificationOpen ? " is-active" : ""}`}
          aria-label={notificationLabel}
          aria-expanded={isNotificationOpen}
          aria-haspopup="dialog"
          onClick={() => setIsNotificationOpen((prev) => !prev)}
        >
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="header-actions__badge" aria-hidden="true" />
          ) : null}
        </button>

        {isNotificationOpen ? (
          <NotificationPopover
            notifications={notifications}
            activeFilter={notificationFilter}
            isLoading={isLoadingNotifications}
            errorMessage={notificationError}
            onClose={() => setIsNotificationOpen(false)}
            onFilterChange={setNotificationFilter}
            onNotificationClick={handleNotificationClick}
          />
        ) : null}
      </div>

      <button
        type="button"
        className="header-actions__button"
        aria-label={profileLabel}
      >
        {hasAvatarImage ? (
          <img
            className="header-actions__avatar-image"
            src={avatarSrc}
            alt={avatarLabel}
            onError={() => setHasAvatarError(true)}
          />
        ) : (
          <span className="header-actions__avatar" aria-hidden="true">
            {avatarText}
          </span>
        )}
      </button>
    </div>
  );
}

export default HeaderActions;
