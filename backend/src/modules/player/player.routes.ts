import type { FastifyPluginAsync } from "fastify";

import { getPlayerDto } from "./player.service.js";

export const playerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return getPlayerDto();
  });
};

