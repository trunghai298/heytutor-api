import { BadRequestError } from "../utils/errors";
import Notification from "../models/notification.model";

/**
 * To get user's notification
 */
const listNotification = async (ctx) => {
  const userId = ctx?.user?.id || 2;

  try {
    const res = await Notification.findAll({
      where: { userId },
    });
    const unread = res.filter((item) => item.status !== "read");
    const read = res.filter((item) => item.status === "read");

    return { unread, read };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: error,
    });
  }
};

const updateStatus = async (notiId) => {
  try {
    const res = await Notification.update(
    {
      status: "read",
    },
    {
      where: {
        notiId,
      }
    })

    return "Success!";
  } catch (error) {
    return error;
  }
}

export default {
  listNotification,
};
