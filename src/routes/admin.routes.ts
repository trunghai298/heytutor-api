import { Application } from "express";
import AdminController from "../controller/admin.controller";

export default (app: Application) => {
  app
    .put("/add-new-collaborator", AdminController.addCollaborator)
    .put("/update-collaborator", AdminController.updateCollaborator)
    .get("/get-system-detail", AdminController.systemDetailsInXDays)
    .put("/approve-event", AdminController.approveEvent)
    .get("/list-collaborators", AdminController.listCollaborator)
    .get("/manage-user-event", AdminController.getListUserEventInfo)
};
