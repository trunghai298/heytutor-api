import { Application } from "express";
import AdminController from "../controller/admin.controller";

export default (app: Application) => {
  app
    .put("/add-new-collaborator", AdminController.addCollaborator)
    .put("/update-collaborator", AdminController.updateCollaborator);
};
