import UserEventController from "../controller/user-event.controller";

export default (app) => {
  app
    .get("/user-event/list", UserEventController.list)
    .put("/update-user-event", UserEventController.registerEvent);
};
