import { Application } from "express";
import ActivityController from "../controller/activity.controller";

export default (app: Application) => {
  app.get("/activity", ActivityController.list);
};
