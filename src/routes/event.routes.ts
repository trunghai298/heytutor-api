import EventController from "../controller/event.controller";

export default (app) => {
  app
    .post("/event", EventController.create)
    .put("/event/:id", EventController.edit)
    .delete("/event/:id", EventController.deleteEvent);
};
