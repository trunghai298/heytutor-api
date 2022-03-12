import { Application } from "express";
import AuthController from "../controller/auth.controller";

export default (app: Application) => {
  app.get("/auth/jwt", AuthController.fetch);
};
