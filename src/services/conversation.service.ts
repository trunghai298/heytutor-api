import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import { Op } from "sequelize";

/**
 * To list all messages of a conversation
 */
const getConversationOfPost = async (params, ctx) => {
  const myUserId = ctx?.user.id || 2;
  const { postId } = params;

  const conversations = await Conversation.findOne({
    where: {
      postId,
      [Op.or]: [
        {
          userId1: {
            [Op.eq]: myUserId,
          },
        },
        {
          userId2: { [Op.eq]: myUserId },
        },
      ],
    },
    logging: true,
  });

  return conversations;
};

export default {
  getConversationOfPost,
};
