import type { FastifyPluginAsync } from "fastify";

import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { attackBoss, getNextCard, getTodayRaid } from "./raid.service.js";

export const raidRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    const player = await getCurrentPlayer(request);
    return getTodayRaid(player.id);
  });

  app.get("/next-card", async (request) => {
    const player = await getCurrentPlayer(request);
    return getNextCard(player.id);
  });

  app.post("/attack", async (request, reply) => {
    const player = await getCurrentPlayer(request);
    const body = request.body as { cardId?: unknown; answer?: unknown };
    if (typeof body?.cardId !== "string" || typeof body?.answer !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "cardId(string) and answer(string) are required",
        statusCode: 400,
      });
    }

    try {
      return await attackBoss(player.id, body.cardId, body.answer);
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

