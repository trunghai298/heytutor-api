import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import { Op } from "sequelize";

/**
 * To list all messages of a conversation
 */
const getConversationOfPost = async (params, ctx) => {
  const myUserId = ctx?.user.id;
  const { postId, userId } = params;

  const conversations = await Conversation.findOne({
    where: {
      postId: parseInt(postId),
      [Op.or]: [
        {
          userId1: {
            [Op.eq]: myUserId,
          },
          userId2: {
            [Op.eq]: parseInt(userId),
          },
        },
        {
          userId2: { [Op.eq]: myUserId },
          userId1: { [Op.eq]: parseInt(userId) },
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
