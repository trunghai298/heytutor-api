import ConversationServices from "../services/conversation.service";

const getConversationOfPost = (req, res, next) => {
  ConversationServices.getConversationOfPost(req.query, req.ctx)
    .then((c) => res.json(c))
    .catch(next);
};

export default {
  getConversationOfPost,
};
