import ConversationServices from "../services/conversation";

const list = (req, res, next) => {
  ConversationServices.listConversations(req.params, req.ctx)
    .then((c) => res.json(c))
    .catch(next);
};

export default {
  list,
};
