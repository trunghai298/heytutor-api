import { BadRequestError } from "../utils/errors";
import Notification from "../models/notification.model";

/**
 * To get user's notification
 */
const listNotification = async (ctx) => {
  const userId = ctx?.user?.id;

  try {
    const res = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: error,
    });
  }
};

const readNoti = async (notiId) => {
  try {
    await Notification.update(
      {
        status: "read",
      },
      {
        where: {
          id: notiId,
        },
      }
    );

    return { status: 200 };
  } catch (error) {
    return error;
  }
};

const create = async (payload) => {
  try {
    const res = await Notification.create({
      ...payload,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: error,
    });
  }
};

export default {
  create,
  readNoti,
  listNotification,
};
