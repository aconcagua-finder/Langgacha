import type { FastifyPluginAsync } from "fastify";

import { generateCard, listCards } from "./cards.service.js";

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
};

