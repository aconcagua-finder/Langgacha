import type { GeneratedCard } from "../types/card";
import { API_URL } from "./config";

export const openBooster = async (): Promise<GeneratedCard[]> => {
  const res = await fetch(`${API_URL}/api/boosters/open`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to open booster: ${res.status}`);
  return (await res.json()) as GeneratedCard[];
};

