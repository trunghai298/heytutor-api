import MessageCtrl from "../controller/message.controller";

export default (app) => {
  app.post("/message", MessageCtrl.create).get("/messages", MessageCtrl.list);
};
