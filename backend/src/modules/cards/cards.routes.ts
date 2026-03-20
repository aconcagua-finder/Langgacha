import type { FastifyPluginAsync } from "fastify";

import { disintegrateCard, generateCard, listCards } from "./cards.service.js";

export const cardsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/generate", async () => {
    return generateCard();
  });

  app.get("/", async (request) => {
    const query = request.query as {
      type?: string | string[];
      rarity?: string | string[];
      sort?: string;
    };
    return listCards(query);
  });

  app.post("/:cardId/disintegrate", async (request, reply) => {
    const params = request.params as { cardId: string };
    try {
      return await disintegrateCard(params.cardId);
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
