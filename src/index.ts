import app from "./app";
import { LogClient } from "./clients/logger";
import { NodeEnv, SERVER_PORT, APP_NAME_DEFAULT } from "./constants/server";

import jobController from "./controller/job.controller"
jobController.dailyCheck(); 

const PORT = process.env.SERVER_PORT || SERVER_PORT;

// const PORT = 3002;

(async () => {
  app.set("port", PORT);
  const appName = process.env.APP_NAME || APP_NAME_DEFAULT;

  app.listen(PORT, () => {
    LogClient.info(
      `${appName} is running at http://localhost:${PORT} in ${
        process.env.NODE_ENV || NodeEnv.Development
      } mode`
    );
  });
})();
