import ConversationCtrl from "../controller/conversation";

export default (app) => {
  app.get("/conversations", ConversationCtrl.list);
};
