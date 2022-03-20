import { Application } from "express";
import AdminController from "../controller/admin.controller";

export default (app: Application) => {
  app.get("/admin", AdminController.fetch);
};
