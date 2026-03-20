import { API_URL } from "./config";
import { clearToken, getToken } from "../shared/token";

const USER_KEY = "lg_user";

const clearAuthState = () => {
  clearToken();
  localStorage.removeItem(USER_KEY);
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
  const res = await fetch(fullUrl, { ...options, headers });

  if (res.status === 401) {
    clearAuthState();
    window.location.assign("/login");
    throw new Error("Unauthorized");
  }

  return res;
};

