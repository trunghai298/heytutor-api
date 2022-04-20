import UserEventController from "../controller/user-event.controller";

export default (app) => {
  app
    .get("/user-event/list", UserEventController.list)
    .post("/join-event", UserEventController.joinEvent)
    .delete("/unjoin-event", UserEventController.unJoinEvent);
};
