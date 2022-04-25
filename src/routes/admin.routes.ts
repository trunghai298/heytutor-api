import { Application } from "express";
import AdminController from "../controller/admin.controller";

export default (app: Application) => {
  app
    .put("/add-new-collaborator", AdminController.addCollaborator)
    .put("/update-collaborator", AdminController.updateCollaborator)
    .get("/get-system-detail", AdminController.systemDetailsInXDays)
    .put("/approve-event", AdminController.approveEvent)
    // .get("/list-collaborators", AdminController.listCollaborator)
    .get("/manage-user-event", AdminController.getListUserEventInfo)
    .get(
      "/get-active-event-of-collaborator",
      AdminController.getActiveEventOfCollaborator
    )
    .get("/collaborator-information", AdminController.listCollaboratorInfo)
    .get("/get-list-post-manage", AdminController.listPostManage)
    .post("/add-event-pin", AdminController.addEventPin)
    .post("/delete-event-pin", AdminController.deleteEventPin)
    .get("/get-list-pined-event", AdminController.getPinEvent)
    .get("/get-top-10-user-rank", AdminController.getTop10UserRanking)
    .get("/collaborator-detail-information", AdminController.collaboratorInfo)
    .post("/assign-event-admin", AdminController.assignEventAdmin)
    .get("/list-reports-of-user-in-event", AdminController.getListReportOfUser)
};
