import "./notification-popover.css";

const notificationTypeLabelMap = {
  SPACE_NOTIFIED: "공지",
  DOCUMENT_UPLOADED: "자료 업로드",
  DOCUMENT_UPDATED: "자료 수정",
  ANSWER_POSTED: "답변 등록",
};

const filterOptions = [
  { key: "all", label: "모두" },
  { key: "read", label: "읽음" },
  { key: "unread", label: "안 읽음" },
];

function formatRelativeTime(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "방금 전";
  }

  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))}분 전`;
  }

  if (diffMs < day) {
    return `${Math.max(1, Math.floor(diffMs / hour))}시간 전`;
  }

  return `${Math.max(1, Math.floor(diffMs / day))}일 전`;
}

function getNotificationTypeLabel(type) {
  return notificationTypeLabelMap[type] ?? "알림";
}

function NotificationPopover({
  notifications,
  activeFilter,
  isLoading,
  errorMessage,
  onClose,
  onFilterChange,
  onNotificationClick,
}) {
  const totalCount = notifications.length;
  const readCount = notifications.filter((notification) => notification.is_read).length;
  const unreadCount = totalCount - readCount;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "read") {
      return notification.is_read;
    }

    if (activeFilter === "unread") {
      return !notification.is_read;
    }

    return true;
  });

  const countByFilter = {
    all: totalCount,
    read: readCount,
    unread: unreadCount,
  };

  return (
    <section
      className="notification-popover"
      aria-label="알림"
      role="dialog"
      aria-modal="false"
    >
      <div className="notification-popover__header">
        <h2>알림</h2>
        <button
          type="button"
          className="notification-popover__close"
          onClick={onClose}
          aria-label="알림 닫기"
        >
          ×
        </button>
      </div>

      <div className="notification-popover__filters" role="tablist" aria-label="알림 필터">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`notification-popover__filter${
              activeFilter === option.key ? " is-active" : ""
            }`}
            onClick={() => onFilterChange(option.key)}
            role="tab"
            aria-selected={activeFilter === option.key}
          >
            <span>{option.label}</span>
            <span className="notification-popover__filter-count">
              {countByFilter[option.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="notification-popover__body">
        {isLoading ? (
          <p className="notification-popover__empty">알림을 불러오는 중입니다.</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="notification-popover__empty">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && filteredNotifications.length === 0 ? (
          <p className="notification-popover__empty">표시할 알림이 없습니다.</p>
        ) : null}

        {!isLoading && !errorMessage && filteredNotifications.length > 0 ? (
          <ul className="notification-popover__list">
            {filteredNotifications.map((notification) => (
              <li key={notification.notification_id}>
                <button
                  type="button"
                  className={`notification-popover__item${
                    notification.is_read ? "" : " is-unread"
                  }`}
                  onClick={() => onNotificationClick(notification)}
                >
                  <span className="notification-popover__item-icon" aria-hidden="true">
                    알
                  </span>

                  <span className="notification-popover__item-body">
                    <span className="notification-popover__item-title">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <span className="notification-popover__item-message">
                      {notification.message}
                    </span>
                    <span className="notification-popover__item-meta">
                      {formatRelativeTime(notification.created_at)}
                      {" · "}
                      {notification.is_read ? "읽음" : "안 읽음"}
                    </span>
                  </span>

                  {!notification.is_read ? (
                    <span
                      className="notification-popover__item-status"
                      aria-label="읽지 않은 알림"
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default NotificationPopover;
