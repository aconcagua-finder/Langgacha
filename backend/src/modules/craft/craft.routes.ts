import type { FastifyPluginAsync } from "fastify";

import { DUST_PER_CRAFT } from "../../shared/constants.js";
import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { craftCard, getCraftStatus } from "./craft.service.js";

export const craftRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/status", async (request, reply) => {
    try {
      const player = await getCurrentPlayer(request);
      const status = await getCraftStatus(player.id);
      return { ...status, costs: DUST_PER_CRAFT };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });

  app.post("/", async (request, reply) => {
    const body = request.body as { rarity?: unknown };
    const rarity = body?.rarity;
    if (typeof rarity !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "rarity(string) is required",
        statusCode: 400,
      });
    }

    try {
      const player = await getCurrentPlayer(request);
      return await craftCard(player.id, rarity);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });
};
