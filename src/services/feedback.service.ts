import Feedback from "../models/feedback.model";
import User from "../models/user.model";
import RankingService from "./ranking.service";
import ActivityServices from "./activity.service";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import { BadRequestError } from "../utils/errors";

const newFeedback = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { postId, type, score, reason, content, receiverId } = payload;

  try {
    const res = await Feedback.create({
      userId: receiverId,
      postId,
      type,
      score,
      reason,
      content,
      fromUserId: userId,
    });

    const newPayload = { receiverId, score, type };
    await RankingService.reCalculatePoint(newPayload);

    const user = await User.findOne({
      where: { userId },
      attributes: ["name"],
      raw: true,
    });

    const log = await ActivityServices.create({
      userId: userId,
      username: user.name,
      action: NOTI_TYPE.NewFeedback,
      content: `userId: ${userId} create new feedback for userId: ${receiverId} of postId: ${postId}`,
    });

    const result = {
      userId: receiverId,
      postId: postId,
      notificationType: NOTI_TYPE.NewFeedback,
      fromUserId: userId,
      fromUsername: user.name,
    };
    await NotificationService.create(result);

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Cannot find user.",
    });
  }
};

const listMyFeedback = async (ctx, filter) => {
  const userId = ctx?.user?.id;
  try {
    if (filter === 0) {
      const res = await Feedback.findAll({
        where: {
          userId: userId,
        },
        raw: true,
      });

      return res;
    } else if (filter === 1) {
      const res = await Feedback.findAll({
        where: {
          userId: userId,
          type: 1,
        },
        raw: true,
      });

      return res;
    } else if (filter === 2) {
      const res = await Feedback.findAll({
        where: {
          userId: userId,
          type: 2,
        },
        raw: true,
      });

      return res;
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Cannot find user.",
    });
  }
};

export default {
  newFeedback,
  listMyFeedback,
};
