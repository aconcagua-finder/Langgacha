import type { FastifyPluginAsync } from "fastify";

import { openBooster } from "./boosters.service.js";

export const boostersRoutes: FastifyPluginAsync = async (app) => {
  app.post("/open", async () => {
    return openBooster();
  });
};

