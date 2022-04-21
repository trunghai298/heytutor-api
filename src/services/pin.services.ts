import User from "../models/user.model";
import { Op } from "sequelize";
import Pin from "../models/pin.model";
import { BadRequestError } from "../utils/errors";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import Admin from "../models/admin.model";
import { pick, compact, map } from "lodash";
import ActivityServices from "./activity.service";

const createPostPin = async (ctx, postId) => {
  const userId = ctx?.user?.id;
  try {
    const isValid = await Pin.findAll({
      where: {
        userId,
      },
      raw: true,
    });

    if (isValid.length >= 3) {
      return "Over default number pin post!!!";
    } else if (isValid.length < 3) {
      const userName = await User.findOne({
        where: {
          userId,
        },
        attributes: ["name"],
        raw: true,
      }).name;

      await Pin.create({
        postId,
        pinBy: userId,
        userPin: userName,
      });

      const log = await ActivityServices.create({
        userId: userId,
        userName: userName,
        action: "user_pin_post",
        content: `user ${userId} pin post: ${postId}`,
      });

      const notification = {
        userId: userId,
        postId: postId,
        notificationType: NOTI_TYPE.UserPinPost,
        fromUserId: 5,
        fromUserName: "Trung Hai",
      };
      await NotificationService.create(notification);

      return { status: 200 };
    } else {
      const notification = {
        userId: userId,
        postId: postId,
        notificationType: NOTI_TYPE.OverNumberPostPined,
        fromUserId: 5,
        fromUserName: "Trung Hai",
      };
      await NotificationService.create(notification);
    }

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Cannot find post!!!",
    });
  }
};

const userUnPinPost = async (ctx, postId) => {
  const userId = ctx?.user?.id;
  try {
    const post = await Pin.findOne({
      where: {
        postId,
      },
    });

    if (post !== null) {
      await Pin.destroy({
        where: {
          postId,
        },
      });

      const userName = await User.findOne({
        where: {
          userId,
        },
        attributes: ["name"],
        raw: true,
      }).name;

      const log = await ActivityServices.create({
        userId: userId,
        userName: userName,
        action: "user_un_pin_post",
        content: `user ${userId} unpin post: ${postId}`,
      });

      const notification = {
        userId: userId,
        postId: postId,
        notificationType: NOTI_TYPE.UserUnPinPost,
        fromUserId: 5,
        fromUserName: "Trung Hai",
      };
      await NotificationService.create(notification);
    } else {
      const notification = {
        userId: userId,
        postId: postId,
        notificationType: NOTI_TYPE.InexistentPost,
        fromUserId: 5,
        fromUserName: "Trung Hai",
      };
      await NotificationService.create(notification);
    }
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Cannot find post!!!",
    });
  }
};

const checkPin = async () => {
  const fiveHoursBefore = new Date(Date.now() - 5 * 60 * 60 * 1000);
  try {
    const listPost = await Pin.findAll({
      where: {
        postId: {
          [Op.ne]: null,
        },
        createdAt: {
          [Op.gt]: fiveHoursBefore,
        },
      },
    });

    const res = await Promise.all(
      map(listPost, async (pin) => {
        await Pin.destroy({
          where: {
            postId: pin.postId,
          },
        });

        const log = await ActivityServices.create({
          userId: pin.pinBy,
          userName: pin.userPin,
          action: "system_un_pin_post",
          content: `system unpin post ${pin.postId} of user ${pin.pinBy}`,
        });

        const notification = {
          userId: pin.userId,
          postId: pin.postId,
          notificationType: NOTI_TYPE.SysUnPinPost,
          fromUserId: 5,
          fromUserName: "Trung Hai",
        };
        await NotificationService.create(notification);
      })
    );

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Cannot find pin row!!!",
    });
  }
};

const addEventPin = async (ctx, eventId) => {
  const userId = ctx?.user?.id;
  try {
    const admin = await Admin.findOne({
      where: {
        userId,
      },
      attributes: ["name", "role"],
      raw: true,
    });

    if (admin.role === "Admin" || admin.role === "superadmin") {
      await Pin.create({
        eventId,
        pinBy: userId,
        userPin: admin.name,
      });

      const log = await ActivityServices.create({
        userId: userId,
        userName: admin.name,
        action: "add_pin_event",
        content: `admin pin event ${eventId}`,
      });

      return { status: 200 };
    } else {
      return "You do not have permission to perform this action!!!";
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Cannot find admin!!!",
    });
  }
};

const deleteEventPin = async (ctx, eventId) => {
  const userId = ctx?.user?.id;
  try {
    const admin = await Admin.findOne({
      where: {
        userId,
      },
      attributes: ["name", "role"],
      raw: true,
    });

    if (admin.role === "Admin" || admin.role === "superadmin") {
      await Pin.destroy({
        where: {
          eventId,
        },
      });

      const log = await ActivityServices.create({
        userId: userId,
        userName: admin.name,
        action: "Un_pin_event",
        content: `admin unpin event ${eventId}`,
      });

      return { status: 200 };
    } else {
      return "You do not have permission to perform this action!!!";
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Cannot find admin!!!",
    });
  }
};

export default {
  createPostPin,
  checkPin,
  addEventPin,
  deleteEventPin,
  userUnPinPost,
};
