import type { FastifyRequest } from "fastify";

import { prisma } from "../../db/prisma.js";

export const getCurrentPlayer = async (request: FastifyRequest) => {
  const payload = request.user as { userId: string };
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { player: true },
  });
  if (!user?.player) throw new Error("Player not found");
  return user.player;
};

