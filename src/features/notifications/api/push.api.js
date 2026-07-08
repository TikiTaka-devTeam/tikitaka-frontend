import { apiClient } from "../../../lib/api/client.js";

const DEVICE_TYPE = "WEB";
const DEVICE_TOKEN_STORAGE_KEY = "tikitaka_device_token";
const DEVICE_TOKEN_ID_STORAGE_KEY = "tikitaka_device_token_id";

let deviceTokenRegistrationPromise = null;

function getRegisteredDeviceToken() {
  return localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY) || "";
}

function getRegisteredDeviceTokenId() {
  return localStorage.getItem(DEVICE_TOKEN_ID_STORAGE_KEY) || "";
}

function getDeviceTokenId(data) {
  return (
    data?.device_token_id ??
    data?.deviceTokenId ??
    data?.id ??
    data?.deviceToken?.device_token_id ??
    data?.deviceToken?.id ??
    ""
  );
}

function storeRegisteredDeviceToken({ deviceToken, deviceTokenId }) {
  localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, deviceToken);

  if (deviceTokenId) {
    localStorage.setItem(DEVICE_TOKEN_ID_STORAGE_KEY, String(deviceTokenId));
  }
}

export function clearRegisteredDeviceToken() {
  localStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  localStorage.removeItem(DEVICE_TOKEN_ID_STORAGE_KEY);
}

export async function registerDeviceToken(deviceToken) {
  if (!deviceToken) {
    return null;
  }

  const registeredDeviceToken = getRegisteredDeviceToken();
  const registeredDeviceTokenId = getRegisteredDeviceTokenId();

  if (registeredDeviceToken === deviceToken && registeredDeviceTokenId) {
    return {
      device_token: registeredDeviceToken,
      device_token_id: registeredDeviceTokenId,
    };
  }

  if (!deviceTokenRegistrationPromise) {
    deviceTokenRegistrationPromise = apiClient
      .post("/device-tokens", {
        device_token: deviceToken,
        device_type: DEVICE_TYPE,
      })
      .then(({ data }) => {
        const deviceTokenId = getDeviceTokenId(data);

        if (!deviceTokenId) {
          console.warn("device token 등록 응답에서 device_token_id를 찾지 못했습니다.");
        }

        storeRegisteredDeviceToken({ deviceToken, deviceTokenId });

        return data;
      })
      .finally(() => {
        deviceTokenRegistrationPromise = null;
      });
  }

  return deviceTokenRegistrationPromise;
}

export async function unregisterStoredDeviceToken() {
  const deviceTokenId = getRegisteredDeviceTokenId();

  if (!deviceTokenId) {
    clearRegisteredDeviceToken();
    return;
  }

  try {
    await apiClient.delete(
      `/device-tokens/${encodeURIComponent(deviceTokenId)}`,
    );
  } finally {
    clearRegisteredDeviceToken();
  }
}

export function sendPushTestNotification(payload = {}) {
  return apiClient.post("/push/test", {
    title: payload.title ?? "테스트 알림",
    body: payload.body ?? "푸시 알림 테스트입니다.",
  });
}
