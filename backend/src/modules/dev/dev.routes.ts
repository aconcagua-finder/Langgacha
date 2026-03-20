import type { FastifyPluginAsync } from "fastify";

import { prisma } from "../../db/prisma.js";
import { MAX_BOOSTERS } from "../../shared/constants.js";
import { getCurrentPlayer } from "../auth/auth.helpers.js";
import { getOrCreateDefaultPlayer, getPlayerDto } from "../player/player.service.js";
import { generateRaidBoss } from "../raid/raid.boss.js";

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
      pityCounter?: unknown;
      resetRaidAttacks?: unknown;
      raidBossHp?: unknown;
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
    const pityCounter =
      typeof body.pityCounter === "number"
        ? clampInt(body.pityCounter)
        : body.pityCounter == null
          ? null
          : NaN;
    const resetRaidAttacks = body.resetRaidAttacks === true;
    const raidBossHp =
      typeof body.raidBossHp === "number"
        ? clampInt(body.raidBossHp)
        : body.raidBossHp == null
          ? null
          : NaN;

    if (
      Number.isNaN(dust) ||
      Number.isNaN(addDust) ||
      Number.isNaN(pityCounter) ||
      Number.isNaN(raidBossHp)
    ) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "dust/addDust/pityCounter/raidBossHp must be numbers if provided",
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

    if (pityCounter !== null) {
      await prisma.player.update({
        where: { id: player.id },
        data: { pityCounter: Math.max(0, pityCounter) },
      });
    }

    if (resetRaidAttacks || raidBossHp !== null) {
      const date = new Date().toISOString().slice(0, 10);
      const raidDay = (await prisma.raidDay.findUnique({ where: { date } })) ?? (await generateRaidBoss(date));

      if (resetRaidAttacks) {
        await prisma.raidAttack.deleteMany({
          where: { raidDayId: raidDay.id, playerId: player.id },
        });
      }

      if (raidBossHp !== null) {
        const hp = Math.max(0, raidBossHp);
        const bossHp = Math.max(raidDay.bossHp, hp);
        await prisma.raidDay.update({
          where: { id: raidDay.id },
          data: {
            bossHp,
            currentHp: Math.min(hp, bossHp),
            defeated: hp <= 0 ? true : false,
          },
        });
      }
    }

    return getPlayerDto(player.id);
  });
};
