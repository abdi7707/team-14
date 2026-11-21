import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler, notFound } from "./middlewares/errors";
import { router } from "./routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // Without this every request appears to come from the host's proxy, and all users
  // would share one rate-limit bucket.
  app.set("trust proxy", env.TRUST_PROXY_HOPS);

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
