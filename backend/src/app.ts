import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config/index.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { battleRoutes } from "./modules/battle/battle.routes.js";
import { cardsRoutes } from "./modules/cards/cards.routes.js";
import { boostersRoutes } from "./modules/boosters/boosters.routes.js";
import { configRoutes } from "./modules/config/config.routes.js";
import { craftRoutes } from "./modules/craft/craft.routes.js";
import { devRoutes } from "./modules/dev/dev.routes.js";
import { playerRoutes } from "./modules/player/player.routes.js";
import { raidRoutes } from "./modules/raid/raid.routes.js";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(fastifyJwt, { secret: config.jwtSecret });
  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(configRoutes, { prefix: "/api/config" });
  await app.register(cardsRoutes, { prefix: "/api/cards" });
  await app.register(boostersRoutes, { prefix: "/api/boosters" });
  await app.register(craftRoutes, { prefix: "/api/craft" });
  await app.register(devRoutes, { prefix: "/api/dev" });
  await app.register(battleRoutes, { prefix: "/api/battle" });
  await app.register(playerRoutes, { prefix: "/api/player" });
  await app.register(raidRoutes, { prefix: "/api/raid" });

  app.get("/health", async () => ({ ok: true }));

  return app;
};
