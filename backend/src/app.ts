import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config/index.js";
import { cardsRoutes } from "./modules/cards/cards.routes.js";
import { boostersRoutes } from "./modules/boosters/boosters.routes.js";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(cardsRoutes, { prefix: "/api/cards" });
  await app.register(boostersRoutes, { prefix: "/api/boosters" });

  app.get("/health", async () => ({ ok: true }));

  return app;
};
