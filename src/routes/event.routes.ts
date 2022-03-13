import EventController from "../controller/event.controller";

export default (app) => {
  app
    .post("/event", EventController.create)
    .put("/event/:id", EventController.edit)
    .delete("/event/:id", EventController.deleteEvent)
    .get("/get-event-post/:eventId", EventController.getEventPost)
    .get("/get-event-stats/:eventId", EventController.getEventStats)
    .get("/get-list-event-of-user/:userId", EventController.getEventByUser);
};
