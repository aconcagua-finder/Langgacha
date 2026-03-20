import type { FastifyPluginAsync } from "fastify";

import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { openBooster } from "./boosters.service.js";
import { publicBoosterInfo, rechargeAndGet } from "./boosters.recharge.js";

export const boostersRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/status", async (request, reply) => {
    try {
      const player = await getCurrentPlayer(request);
      const status = await rechargeAndGet(player.id);
      return publicBoosterInfo(status);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });

  app.post("/open", async (request, reply) => {
    try {
      const player = await getCurrentPlayer(request);
      return await openBooster(player.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({
        error: "Bad Request",
        message,
        statusCode: 400,
      });
    }
  });
};
