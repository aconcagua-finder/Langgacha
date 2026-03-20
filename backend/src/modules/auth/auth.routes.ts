import type { FastifyPluginAsync } from "fastify";

import type { AuthResponse } from "./auth.types.js";
import { login, register } from "./auth.service.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const body = request.body as { username?: unknown; password?: unknown };
    if (typeof body?.username !== "string" || typeof body?.password !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "username(string) and password(string) are required",
        statusCode: 400,
      });
    }

    try {
      const user = await register({ username: body.username, password: body.password });
      const token = app.jwt.sign({ userId: user.id });
      const res: AuthResponse = { token, user };
      return res;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });

  app.post("/login", async (request, reply) => {
    const body = request.body as { username?: unknown; password?: unknown };
    if (typeof body?.username !== "string" || typeof body?.password !== "string") {
      return reply.code(400).send({
        error: "Bad Request",
        message: "username(string) and password(string) are required",
        statusCode: 400,
      });
    }

    try {
      const user = await login({ username: body.username, password: body.password });
      const token = app.jwt.sign({ userId: user.id });
      const res: AuthResponse = { token, user };
      return res;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Client Error";
      return reply.code(400).send({ error: "Bad Request", message, statusCode: 400 });
    }
  });
};

