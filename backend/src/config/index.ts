export type AppConfig = {
  port: number;
  databaseUrl: string;
  corsOrigin: string;
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requireEnv("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};

