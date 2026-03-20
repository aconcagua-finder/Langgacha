import type { FastifyPluginAsync } from "fastify";

import { openBooster } from "./boosters.service.js";
import { getPlayerDto } from "../player/player.service.js";
import { publicBoosterInfo, rechargeAndGet } from "./boosters.recharge.js";

export const boostersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/status", async (request, reply) => {
    try {
      const player = await getPlayerDto();
      const status = await rechargeAndGet(player.id);
      return publicBoosterInfo(status);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });

  app.post("/open", async (request, reply) => {
    try {
      return await openBooster();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      const noBoosters = message.toLowerCase().includes("no boosters");
      return reply.code(noBoosters ? 400 : 400).send({
        error: "Bad Request",
        message,
        statusCode: 400,
      });
    }
  });
};
