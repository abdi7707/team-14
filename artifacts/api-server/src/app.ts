import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";
import { errorHandler, notFound } from "./middlewares/errors";
import { router } from "./routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(
    pinoHttp({
      logger,
      // Never log headers: they carry bearer tokens.
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(cors());
  app.use(express.json());

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
