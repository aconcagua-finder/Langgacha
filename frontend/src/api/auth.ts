import { API_URL } from "./config";

export type AuthResponse = {
  token: string;
  user: { id: string; username: string };
};

const errorMessage = async (res: Response): Promise<string> => {
  try {
    const data = (await res.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `Request failed: ${res.status}`;
};

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as AuthResponse;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as AuthResponse;
};

