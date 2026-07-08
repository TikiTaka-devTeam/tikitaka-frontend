/* global importScripts, firebase */

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBfEho83dePhsm8Z_u0voyDB8XKuEo0g2A",
  authDomain: "tikitaka-5efac.firebaseapp.com",
  projectId: "tikitaka-5efac",
  storageBucket: "tikitaka-5efac.firebasestorage.app",
  messagingSenderId: "351483695335",
  appId: "1:351483695335:web:08104527c04a29c6d25242",
  measurementId: "G-4Y663ST2BK",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload?.notification?.title ??
    payload?.data?.title ??
    "TikiTaka";

  self.registration.showNotification(title, {
    body: payload?.notification?.body ?? payload?.data?.body ?? "",
    icon: payload?.notification?.icon ?? "/favicon.svg",
    data: payload?.data ?? {},
  });
});
