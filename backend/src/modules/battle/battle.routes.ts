import type { FastifyPluginAsync } from "fastify";

import { answerRound, startBattle } from "./battle.service.js";

export const battleRoutes: FastifyPluginAsync = async (app) => {
  app.post("/start", async (request, reply) => {
    const body = request.body as { cardIds?: unknown };
    const cardIds = body?.cardIds;
    if (!Array.isArray(cardIds)) {
      app.log.warn({ body }, "Invalid /battle/start payload");
      return reply.code(400).send({
        error: "Bad Request",
        message: "cardIds must be an array",
        statusCode: 400,
      });
    }
    try {
      return await startBattle(cardIds as string[]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });

  app.post("/:battleId/answer", async (request, reply) => {
    const params = request.params as { battleId: string };
    const body = request.body as { roundNumber?: unknown; answer?: unknown };

    if (typeof body?.roundNumber !== "number" || typeof body?.answer !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "roundNumber(number) and answer(string) are required",
        statusCode: 400,
      });
    }

    try {
      return await answerRound({
        battleId: params.battleId,
        roundNumber: body.roundNumber,
        answer: body.answer,
      });
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
