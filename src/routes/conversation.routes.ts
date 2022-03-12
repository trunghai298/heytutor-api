import ConversationCtrl from "../controller/conversation.controller";

export default (app) => {
  app.get("/conversations", ConversationCtrl.list);
};
