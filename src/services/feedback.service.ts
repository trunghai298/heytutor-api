import Feedback from "../models/feedback.model";
import User from "../models/user.model";
import RankingService from "./ranking.service";
import ActivityServices from "./activity.service";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import { BadRequestError } from "../utils/errors";

const newFeedback = async (ctx, payload) => {
  const {user} = ctx;
  const { postId, type, score, reason, content, receiverId } = payload;

  try {
    const res = await Feedback.create({
      userId: receiverId,
      postId,
      type,
      score,
      reason,
      content,
      fromUserId: user.id,
    });

    const newPayload = { receiverId, score, type };
    await RankingService.reCalculatePoint(newPayload);

    const log = await ActivityServices.create({
      userId: user.id,
      username: user.name,
      action: NOTI_TYPE.NewFeedback,
      content: `người dùng ${user.id} tạo đánh giá mới cho người dùng ${receiverId} trong vấn đề ${postId}`,
    });

    const result = {
      userId: receiverId,
      postId: postId,
      notificationType: NOTI_TYPE.NewFeedback,
      fromUserId: user.id,
      fromUsername: user.name,
    };
    await NotificationService.create(result);

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Không tìm thấy tài khoản.",
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
      message: "Không tìm thấy người dùng.",
    });
  }
};

export default {
  newFeedback,
  listMyFeedback,
};
