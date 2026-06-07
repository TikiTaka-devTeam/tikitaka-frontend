import { API_BASE_URL } from "../config/api.js";

export function resolveAssetUrl(url) {
  if (!url) return "";

  const value = String(url).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
}
