import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import { Op } from "sequelize";
import { BadRequestError, NotFoundError } from "../utils/errors";

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
    raw: true,
    logging: true,
  });

  return conversations;
};

const checkUnreadMessage = async (ctx, params) => {
  const myUserId = ctx?.user.id;
  try {
    const conversationId = getConversationOfPost(params, ctx);

    const res = Message.findAll({
      where: {
        conversationId: conversationId,
        receiverId: myUserId,
        isSeen: 0,
      },
      raw: true,
      order: ["createdAt", "DESC"],
    });
    if (res.length === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

export default {
  getConversationOfPost,
  checkUnreadMessage,
};
