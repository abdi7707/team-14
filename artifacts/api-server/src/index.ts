import { createApp } from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";

createApp().listen(env.PORT, (error) => {
  if (error) {
    logger.fatal({ err: error }, "API server failed to start");
    process.exit(1);
  }
  logger.info({ port: env.PORT }, "API server listening");
});
