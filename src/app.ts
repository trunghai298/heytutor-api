import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { initPassport } from "./middlewares/passport";
import { initLogger } from "./middlewares/logger";
import { initCORS } from "./middlewares/cors";
import { initSecurity } from "./middlewares/security";
import { NodeEnv } from "./constants/server";

import Route from "./routes";
import MySQLClient from "./clients/mysql";
const app = express();

// Third party middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(initPassport());

app.use(initCORS());

app.get("/mysql", async (req, res) => {
  await MySQLClient.sync({ force: true });
  res.json({ message: "MySQL reset" });
});

// Custom middlewares
process.env.NODE_ENV !== NodeEnv.Test && app.use(initLogger());
app.use(initSecurity());

Route(app);
app.get("/", (req, res) => res.send("Hello World"));

export default app;
