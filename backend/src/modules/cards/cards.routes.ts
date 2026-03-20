import type { FastifyPluginAsync } from "fastify";

import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { disintegrateCard, generateCard, listCards } from "./cards.service.js";

export const cardsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.post("/generate", async (request) => {
    const player = await getCurrentPlayer(request);
    return generateCard(player.id);
  });

  app.get("/", async (request) => {
    const player = await getCurrentPlayer(request);
    const query = request.query as {
      type?: string | string[];
      rarity?: string | string[];
      sort?: string;
    };
    return listCards(player.id, query);
  });

  app.post("/:cardId/disintegrate", async (request, reply) => {
    const player = await getCurrentPlayer(request);
    const params = request.params as { cardId: string };
    try {
      return await disintegrateCard(player.id, params.cardId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      const notFound = message.toLowerCase().includes("not found");
      return reply.code(notFound ? 404 : 400).send({
        error: notFound ? "Not Found" : "Bad Request",
        message,
        statusCode: notFound ? 404 : 400,
      });
    }
  });
};
