import ConversationServices from "../services/conversation.service";

const list = (req, res, next) => {
  ConversationServices.listConversations(req.params, req.ctx)
    .then((c) => res.json(c))
    .catch(next);
};

export default {
  list,
};
