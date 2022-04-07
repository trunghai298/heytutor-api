import Message from "../models/message.model";
import { BadRequestError } from "../utils/errors";
import { isEmpty } from "lodash";
import MySQLClient from "../clients/mysql";
import Conversation from "../models/conversation.model";
import moment from "moment";
import { map } from "lodash";
import User from "../models/user.model";
import { Op } from "sequelize";

/**
 * To create a new message
 */
const create = async (body, ctx) => {
  const { user } = ctx;
  const { message, receiverId, receiverName, postId } = body;
  try {
    let conversation = await Conversation.findOne({
      where: {
        postId,
        [Op.or]: [
          {
            userId1: {
              [Op.eq]: user.id,
            },
          },
          {
            userId2: { [Op.eq]: user.id },
          },
        ],
      },
      logging: true,
      raw: true,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        userId1: user.id,
        userId2: receiverId,
        postId,
        status: "open",
      });
    }

    const messageResult = await Message.create({
      receiverId,
      receiverName,
      senderId: user.id,
      senderName: user.name,
      message,
      isSeen: 0,
      seenAt: null,
      conversationId: conversation.id,
    });

    // send message to socket
    // sendNewMessage(receiver.email, conversation.id, session.id, settings);

    return messageResult;
  } catch (error) {
    throw new BadRequestError({
      field: "eventId",
      message: error,
    });
  }
};

/**
 * To list all messages of a conversation
 */
const listMessages = async (params) => {
  const { conversationId, offset, limit } = params;

  try {
    const messages = await Message.findAndCountAll({
      where: {
        conversationId: parseInt(conversationId),
      },
      offset: parseInt(offset) || 0,
      limit: parseInt(limit) || 100,
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    return messages;
  } catch (error) {
    throw new BadRequestError({
      field: "eventId",
      message: error,
    });
  }
};

export default {
  create,
  listMessages,
};
