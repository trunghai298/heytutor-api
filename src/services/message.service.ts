import Message from "../models/message.model";
import { BadRequestError } from "../utils/errors";
import { isEmpty } from "lodash";
import MySQLClient from "../clients/mysql";
import Conversation from "../models/conversation.model";
import moment from "moment";
import { map } from "lodash";
import User from "../models/user.model";

/**
 * To create a new message
 */
const create = async (body, ctx) => {
  const { user } = ctx;
  const { message, receiverId, cId } = body;

  if (receiverId === user.id) {
    throw new BadRequestError({
      field: "receiverId",
      message: "You can not send message to yourself.",
    });
  }

  if (receiverId === 0) {
    throw new BadRequestError({
      field: "receiverId",
      message: "Receiver is not a valid user",
    });
  }

  if (user.id === 0) {
    throw new BadRequestError({
      field: "senderId",
      message: "Sender is not a valid user",
    });
  }

  if (isEmpty(message)) {
    throw new BadRequestError({
      field: "message",
      message: "Field message is empty.",
    });
  }
  const transaction = await MySQLClient.transaction();
  let conversation = await Conversation.findOne({
    where: {
      $or: [
        {
          userId1: user.id,
          id: cId,
        },
        {
          userId2: user.id,
          id: cId,
        },
      ],
    },
  });

  if (!conversation) {
    if (!receiverId) {
      throw new BadRequestError({
        field: "receiverId",
        message: "Field receiverId is empty.",
      });
    }

    conversation = await Conversation.create(
      {
        userId1: user.id,
        userId2: receiverId,
      },
      { transaction }
    );
  }

  const messageResult = await Message.create(
    {
      receiverId,
      senderId: user.id,
      message,
      conversationId: conversation.id,
      createdAt: moment(),
    },
    { transaction }
  );

  // send message to socket
  // sendNewMessage(receiver.email, conversation.id, session.id, settings);

  return messageResult;
};

/**
 * To list all messages of a conversation
 */
const listMessages = async (params) => {
  const { conversationId, offset, limit } = params;

  try {
    if (!conversationId) {
      throw new BadRequestError({
        field: "conversationId",
        message: "Field conversationId is empty.",
      });
    }

    const messages = await Message.findAndCountAll({
      where: {
        conversationId: parseInt(conversationId),
      },
      offset: parseInt(offset) || 0,
      limit: parseInt(limit) || 10,
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    return messages;
  } catch (error) {
    throw error;
  }
};

export default {
  create,
  listMessages,
};
