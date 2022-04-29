import NotificationController from "../controller/notification.controller";

export default (app) => {
  console.log("app", app);
  app.get("/notifications", NotificationController.listNotification);
  app.put("/notifications/read", NotificationController.readNoti);
};
