import type { FastifyPluginAsync } from "fastify";

import { prisma } from "../../db/prisma.js";
import { MAX_BOOSTERS } from "../../shared/constants.js";
import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { getOrCreateDefaultPlayer, getPlayerDto } from "../player/player.service.js";

const clampInt = (value: number): number => (Number.isFinite(value) ? Math.floor(value) : 0);

export const devRoutes: FastifyPluginAsync = async (app) => {
  app.post("/reset", async (request, reply) => {
    if (process.env.NODE_ENV === "production") {
      return reply.code(403).send({
        error: "Forbidden",
        message: "Dev endpoints are disabled in production",
        statusCode: 403,
      });
    }

    const getPlayerForDev = async () => {
      if (request.headers.authorization) {
        try {
          await request.jwtVerify();
          return await getCurrentPlayer(request);
        } catch {
          // ignore invalid tokens for dev endpoint
        }
      }
      return await getOrCreateDefaultPlayer();
    };

    const body = (request.body ?? {}) as {
      boosters?: unknown;
      craft?: unknown;
      dust?: unknown;
      addDust?: unknown;
    };

    const boosters = body.boosters === true;
    const craft = body.craft === true;
    const dust =
      typeof body.dust === "number" ? clampInt(body.dust) : body.dust == null ? null : NaN;
    const addDust =
      typeof body.addDust === "number"
        ? clampInt(body.addDust)
        : body.addDust == null
          ? null
          : NaN;

    if (Number.isNaN(dust) || Number.isNaN(addDust)) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "dust/addDust must be numbers if provided",
        statusCode: 400,
      });
    }

    const player = await getPlayerForDev();

    if (boosters) {
      await prisma.player.update({
        where: { id: player.id },
        data: { boosterCount: MAX_BOOSTERS, lastBoosterAt: new Date() },
      });
    }

    if (craft) {
      await prisma.player.update({
        where: { id: player.id },
        data: { lastCraftAt: null },
      });
    }

    if (dust !== null) {
      await prisma.player.update({
        where: { id: player.id },
        data: { dust: Math.max(0, dust) },
      });
    } else if (addDust !== null) {
      const current = await prisma.player.findUnique({
        where: { id: player.id },
        select: { dust: true },
      });
      const next = Math.max(0, (current?.dust ?? 0) + addDust);
      await prisma.player.update({ where: { id: player.id }, data: { dust: next } });
    }

    return getPlayerDto(player.id);
  });
};
