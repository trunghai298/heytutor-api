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
import adminController from "./controller/admin.controller";
import Student from "./models/student.model";
import Class from "./models/class.model";
import Course from "./models/course.model";
import Department from "./models/department.model";
import User from "./models/user.model";
const app = express();

// Third party middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(initPassport());

require("dotenv").config();
console.log(
  `Connected to ${process.env.DB_HOST} - dbName: ${process.env.DB_NAME} - port: ${process.env.DB_PORT}`
);

const compare = require("tsscmp");
const auth = require("basic-auth");

function check(name: any, pass: any) {
  var valid = true;

  valid = compare(name, "root") && valid;
  valid = compare(pass, "root") && valid;
  return valid;
}
const basicAuth = (req: any, res: any, next: any) => {
  const user = auth(req);
  if (!user || !check(user.name, user.pass)) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  } else {
    next();
  }
};

app.get("/admin/create", basicAuth, adminController.createAdmin);

app.use(initCORS());

app.get("/auth/google", authenticateGoogle());
// Allow to generate anonymous JWT for new user
app.post("/auth/login", AuthController.login);
app.post("/auth/admin", AuthController.adminLogin);

const resetDb = async () => {
  try {
    // await User.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
};

app.get("/auth/google/callback", authenticateGoogle(), async (req, res) => {
  const token = await sign({ user: req.user });
  if (!req.user.email.includes("fpt.edu.vn")) {
    res.redirect(`http://localhost:3000?error=access_denied`);
  } else {
    res.redirect(`http://localhost:3000?token=${token}`);
  }
});

app.get("/mysql", async (req, res) => {
  await resetDb();
  res.send({ message: "sync database successful" });
  // await setupFakeData(req, res);
});

app.get("/fap-data", async (req, res, next) => {
  await Promise.all([
    Student.sync({ force: true }),
    Class.sync({ force: true }),
    Course.sync({ force: true }),
    Department.sync({ force: true }),
  ]);
  await fetchFapData(req.query.fapCookie as string, req.query.termId as string);
  res.send({ message: "Insert data successfully" });
});

// Custom middlewares
process.env.NODE_ENV !== NodeEnv.Test && app.use(initLogger());
app.use(initSecurity());

app.get("/", (req, res) => res.send("Hello World"));

// JWT verification
app.use(authenticateJWT());
Route(app);

export default app;
