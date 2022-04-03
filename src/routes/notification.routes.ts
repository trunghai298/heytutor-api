import NotificationController from "../controller/notification.controller";

export default (app) => {
  app.get("/notifications", NotificationController.listNotification);
};
