import type { FastifyPluginAsync } from "fastify";

import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { getPlayerDto } from "./player.service.js";

export const playerRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    const player = await getCurrentPlayer(request);
    return getPlayerDto(player.id);
  });
};
