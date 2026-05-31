const now = Date.now();

const mockNotificationSeed = [
  {
    notification_id: "noti-1",
    type: "SPACE_NOTIFIED",
    message: "캡스톤디자인(CE)에 새로운 공지가 등록되었어요.",
    target_url: "/spaces/space-1/notices/notice-1",
    is_read: false,
    created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    notification_id: "noti-2",
    type: "DOCUMENT_UPLOADED",
    message: "운영체제(CE)에 새로운 강의자료가 업로드되었어요.",
    target_url: "/documents/doc-2",
    is_read: false,
    created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    notification_id: "noti-3",
    type: "DOCUMENT_UPDATED",
    message: "인터넷프로그래밍 강의자료가 최신 버전으로 수정되었어요.",
    target_url: "/documents/doc-3",
    is_read: false,
    created_at: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    notification_id: "noti-4",
    type: "ANSWER_POSTED",
    message: "운영체제 주차 강의자료의 질문에 답변이 등록되었어요.",
    target_url: "/questions/question-4",
    is_read: true,
    created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
  },
];

const targetTypeByNotificationType = {
  SPACE_NOTIFIED: "NOTICE",
  DOCUMENT_UPLOADED: "DOCUMENT",
  DOCUMENT_UPDATED: "DOCUMENT",
  ANSWER_POSTED: "QUESTION",
};

let notificationStore = mockNotificationSeed.map((notification) => ({
  ...notification,
}));

function wait(ms = 180) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export async function getMockNotifications({ isRead } = {}) {
  await wait();

  const notifications = notificationStore
    .filter((notification) =>
      typeof isRead === "boolean" ? notification.is_read === isRead : true,
    )
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

  return clone(notifications);
}

export async function patchMockNotificationRead(notificationId) {
  await wait(120);

  const index = notificationStore.findIndex(
    (notification) => notification.notification_id === notificationId,
  );

  if (index < 0) {
    throw new Error("Notification not found.");
  }

  notificationStore[index] = {
    ...notificationStore[index],
    is_read: true,
  };

  return clone({
    notification_id: notificationId,
    is_read: true,
  });
}

export async function getMockNotificationTarget(notificationId) {
  await wait(120);

  const notification = notificationStore.find(
    (item) => item.notification_id === notificationId,
  );

  if (!notification) {
    throw new Error("Notification not found.");
  }

  return clone({
    notification_id: notification.notification_id,
    type: notification.type,
    target_type: targetTypeByNotificationType[notification.type] ?? "UNKNOWN",
    target_url: notification.target_url,
  });
}
