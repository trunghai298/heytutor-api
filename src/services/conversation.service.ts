import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

/**
 * To list all messages of a conversation
 */
const listConversations = async (params, ctx) => {
  const { user } = ctx;
  const { offset, limit } = params;

  const conversations = await Conversation.findAndCountAll({
    distinct: true,
    where: {
      $or: [
        {
          userId1: user.id,
        },
        {
          userId2: user.id,
        },
      ],
    },
    include: [
      {
        model: Message,
        limit: 1,
        order: [["createdAt", "DESC"]],
      },
    ],
    offset,
    limit,
  });

  return conversations;
};

export default {
  listConversations,
};
