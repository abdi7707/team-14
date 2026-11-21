import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";
import { errorHandler, notFound } from "./middlewares/errors";
import { router } from "./routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // The hosting platform puts one proxy in front of the API; without this every
  // request appears to come from the proxy and rate limits would be shared by all users.
  app.set("trust proxy", 1);

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
