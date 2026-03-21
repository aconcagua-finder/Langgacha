import type { FastifyPluginAsync } from "fastify";

import { getCurrentPlayer } from "../auth/auth.helpers.js";

import { evolveCard, getEvolutionStatus } from "./evolution.service.js";

export const evolutionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/status/:cardId", async (request, reply) => {
    const player = await getCurrentPlayer(request);
    const params = request.params as { cardId: string };

    try {
      return await getEvolutionStatus(player.id, params.cardId);
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

  app.post("/evolve", async (request, reply) => {
    const player = await getCurrentPlayer(request);
    const body = request.body as { cardId?: unknown };

    if (typeof body?.cardId !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "cardId(string) is required",
        statusCode: 400,
      });
    }

    try {
      return await evolveCard(player.id, body.cardId);
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
