import MessageCtrl from "../controller/message";

export default (app) => {
  app.post("/message", MessageCtrl.create).get("/messages", MessageCtrl.list);
};
