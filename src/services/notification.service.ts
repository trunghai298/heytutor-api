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

export default {
  listNotification,
};
