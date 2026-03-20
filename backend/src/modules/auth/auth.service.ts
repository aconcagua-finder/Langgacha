import bcrypt from "bcryptjs";

import { prisma } from "../../db/prisma.js";
import { STARTING_DUST } from "../../shared/constants.js";

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export const validateUsername = (username: string): void => {
  if (!USERNAME_RE.test(username)) {
    throw new Error("Invalid username");
  }
};

export const register = async (params: {
  username: string;
  password: string;
}): Promise<{ id: string; username: string }> => {
  const username = params.username.trim();
  validateUsername(username);
  if (!params.password) throw new Error("Invalid credentials");

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already taken");

  const hash = await bcrypt.hash(params.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { username, password: hash },
      select: { id: true, username: true },
    });
    await tx.player.create({
      data: { name: "Player", dust: STARTING_DUST, userId: created.id },
    });
    return created;
  });

  return user;
};

export const login = async (params: {
  username: string;
  password: string;
}): Promise<{ id: string; username: string }> => {
  const username = params.username.trim();
  if (!username || !params.password) throw new Error("Invalid credentials");

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, password: true },
  });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(params.password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  return { id: user.id, username: user.username };
};

