import MessageCtrl from "../controller/message.controller";

export default (app) => {
  app
    .post("/message", MessageCtrl.create)
    .get("/list-messages", MessageCtrl.list);
};
