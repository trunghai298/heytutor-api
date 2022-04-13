import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {
  authenticateGoogle,
  authenticateJWT,
  initPassport,
} from "./middlewares/passport";
import { initLogger } from "./middlewares/logger";
import { initCORS } from "./middlewares/cors";
import { initSecurity } from "./middlewares/security";
import { NodeEnv } from "./constants/server";
import AuthController from "./controller/auth.controller";
import Route from "./routes/index.routes";
import { setupFakeData } from "./utils/setupDb";
import MySQLClient from "./clients/mysql";
import { sign } from "./utils/jwt";
import { fetchFapData } from "./scripts/getStudentsInfo";
import Notification from "./models/notification.model";
import Message from "./models/message.model";
const app = express();

// Third party middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(initPassport());

app.use(initCORS());

app.get("/auth/google", authenticateGoogle());
// Allow to generate anonymous JWT for new user
app.post("/auth/login", AuthController.login);

const resetDb = async () => {
  try {
    // await Message.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
};

app.get("/auth/google/callback", authenticateGoogle(), async (req, res) => {
  const token = await sign({ user: req.user });
  res.redirect(`${process.env.WEB_URL}?token=${token}`);
});

app.get("/mysql", async (req, res) => {
  await resetDb();
  res.send({ message: "sync database successful" });
  // await setupFakeData(req, res);
});

app.get("/fap-data", async (req, res, next) => {
  await resetDb();
  await fetchFapData(req.query.fapCookie as string, req.query.termId as string);
  res.send({ message: "Insert data successfully" });
});

// Custom middlewares
process.env.NODE_ENV !== NodeEnv.Test && app.use(initLogger());
app.use(initSecurity());

// JWT verification
// app.use(authenticateJWT());

Route(app);
app.get("/", (req, res) => res.send("Hello World"));

export default app;
