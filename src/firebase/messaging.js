import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { app } from "./firebaseConfig";

export const messaging = getMessaging(app);

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
let fcmTokenRequestPromise = null;
let hasLoggedPermissionDenied = false;

function getNotificationContent(payload) {
  return {
    title:
      payload?.notification?.title ??
      payload?.data?.title ??
      "TikiTaka",
    options: {
      body: payload?.notification?.body ?? payload?.data?.body ?? "",
      icon: payload?.notification?.icon ?? "/favicon.svg",
      data: payload?.data ?? {},
    },
  };
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

async function issueFcmToken() {
  const isMessagingSupported = await isSupported();

  if (!isMessagingSupported) {
    console.warn("이 브라우저는 Firebase Messaging을 지원하지 않습니다.");
    return null;
  }

  if (!vapidKey) {
    console.warn("VITE_FIREBASE_VAPID_KEY가 설정되어 있지 않습니다.");
    return null;
  }

  if (!("Notification" in window)) {
    console.warn("이 브라우저는 Notification API를 지원하지 않습니다.");
    return null;
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== "granted") {
    if (!hasLoggedPermissionDenied) {
      hasLoggedPermissionDenied = true;
      console.log(
        permission === "denied"
          ? "알림 권한이 브라우저에서 차단되어 FCM Token을 발급할 수 없습니다."
          : "알림 권한이 허용되지 않아 FCM Token을 발급할 수 없습니다.",
      );
    }

    return null;
  }

  const serviceWorkerRegistration = await getServiceWorkerRegistration();

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });

  console.log("FCM Token:", token);
  return token;
}

export function requestFcmToken() {
  if (!fcmTokenRequestPromise) {
    fcmTokenRequestPromise = issueFcmToken().finally(() => {
      fcmTokenRequestPromise = null;
    });
  }

  return fcmTokenRequestPromise;
}

export function listenForegroundMessages() {
  return onMessage(messaging, async (payload) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const { title, options } = getNotificationContent(payload);
    const serviceWorkerRegistration = await getServiceWorkerRegistration();

    if (serviceWorkerRegistration) {
      await serviceWorkerRegistration.showNotification(title, options);
      return;
    }

    new Notification(title, options);
  });
}
    
