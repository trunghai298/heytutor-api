import { BadRequestError } from "../utils/errors";
import Ban from "../models/ban.model";
const { Op } = require("sequelize");
import { map } from "lodash";
import { NOTI_TYPE } from "../constants/notification";
import NotificationService from "./notification.service";
import Admin from "../models/admin.model";
import ActivityServices from "./activity.service";
import ReportService from "./report.service";
import UserPermission from "../models/user-permission.model";

/**
 * To create a new class
 */
// const list = async (ctx) => {
//   try {
//     const res = await Ban.findAll({});
//     return res;
//   } catch (error) {
//     throw new BadRequestError({
//       field: "id",
//       message: "Failed to create this item.",
//     });
//   }
// };

const createBan = async (ctx, payload) => {
  const { user } = ctx;
  const { userId, type, eventId, postId, commentId } = payload;
  const banDate = new Date(Date.now());

  let unBanDate;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      if (type === "1-1" || type === "2-1" || type === "3-1") {
        unBanDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      } else if (type === "1-2" || type === "2-2" || type === "3-2") {
        unBanDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      } else if (type === "1-3" || type === "2-3" || type === "3-3") {
        unBanDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      } else if (type === "1-4" || type === "2-4" || type === "3-4") {
        unBanDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
      const createBan = await Ban.create({
        userId: userId,
        type: type,
        banDate: banDate,
        unbanDate: unBanDate,
        banBy: user.id,
        eventId: eventId,
      });

      const updateReport = await ReportService.resolvedSimilarReport(
        user.id,
        userId,
        eventId,
        postId,
        commentId
      );

      let notiType;
      if (type.includes("1-")) {
        const permission = await UserPermission.update(
          {
            canPost: 0,
          },
          {
            where: {
              userId: userId,
              eventId: eventId,
            },
          }
        );
        notiType = NOTI_TYPE.BanPost;
      } else if (type.includes("2-")) {
        const permission = await UserPermission.update(
          {
            canRegister: 0,
          },
          {
            where: {
              userId: userId,
              eventId: eventId,
            },
          }
        );
        notiType = NOTI_TYPE.BanRegister;
      } else if (type.includes("3-")) {
        const permission = await UserPermission.update(
          {
            canComment: 0,
          },
          {
            where: {
              userId: userId,
              eventId: eventId,
            },
          }
        );
        notiType = NOTI_TYPE.BanComment;
      }

      const log = await ActivityServices.create({
        userId: user.id,
        userName: user.name,
        action: notiType,
        content: `ban user ${userId} with type: ${type} by ${user.id}`,
      });

      const notification = {
        userId: userId,
        postId: postId,
        commentId: commentId,
        eventId: eventId,
        notificationType: notiType,
        fromUserId: user.id,
        fromUserName: user.name,
      };
      await NotificationService.create(notification);

      return { status: 200 };
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền chỉnh sửa thông tin này.",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

// const deleteBan = async () => {
//   const today = new Date(Date.now());
//   try {
//     const listBan = await Ban.findAll({
//       where: {
//         unbanDate: {
//           [Op.gt]: today,
//         }
//       },
//       attributes: ["id"],
//       raw: true,
//     });

//     const res = await Promise.all(
//       map(listBan, async(ban) => {
//         await Ban.destroy({
//           where: {
//             id: ban.id,
//           }
//         })
//       })
//     )
//   } catch (error) {
//     return error;
//   }
// }

const updateBan = async (ctx, payload) => {
  const { user } = ctx;
  const { userId, type, eventId } = payload;
  const today = new Date(Date.now());
  // const banDate = new Date(Date.now());
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const ban = await Ban.findOne({
        where: {
          userId,
          unbanDate: {
            [Op.gt]: today,
          },
          type,
        },
        attributes: ["id", "banDate", "postId", "commentId"],
        raw: true,
      });
      let tempUnBanDate;
      if (ban !== null) {
        if (type === "1-1" || type === "2-1" || type === "3-1") {
          tempUnBanDate = new Date(ban.banDate + 1 * 24 * 60 * 60 * 1000);
        } else if (type === "1-2" || type === "2-2" || type === "3-2") {
          tempUnBanDate = new Date(ban.banDate + 3 * 24 * 60 * 60 * 1000);
        } else if (type === "1-3" || type === "2-3" || type === "3-3") {
          tempUnBanDate = new Date(ban.banDate + 5 * 24 * 60 * 60 * 1000);
        } else if (type === "1-4" || type === "2-4" || type === "3-4") {
          tempUnBanDate = new Date(ban.banDate + 7 * 24 * 60 * 60 * 1000);
        }
        const res = await Ban.update(
          {
            unbanDate: tempUnBanDate,
            updateBy: user.id,
            eventId: eventId,
          },
          {
            where: {
              id: ban.id,
            },
          }
        );

        let notiType;
        if (type.includes("1-")) {
          notiType = NOTI_TYPE.UpdateBanPost;
        } else if (type.includes("2-")) {
          notiType = NOTI_TYPE.UpdateBanRegister;
        } else if (type.includes("3-")) {
          notiType = NOTI_TYPE.UpdateBanComment;
        }

        const log = await ActivityServices.create({
          userId: user.id,
          userName: user.name,
          action: notiType,
          content: `update ban user ${userId} type: ${type} by ${user.id}`,
        });

        const notification = {
          userId: userId,
          postId: ban.postId,
          commentId: ban.commentId,
          eventId: eventId,
          notificationType: notiType,
          fromUserId: user.id,
          fromUserName: user.name,
        };
        await NotificationService.create(notification);

        return { status: 200 };
      } else {
        return "Lệnh cấm đã hết hiệu lực.";
      }
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền chỉnh sửa thông tin này",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const getUserStatusInEvent = async (userId, eventId) => {
  try {
    const banUserInEvent = await Ban.findAll({
      where: {
        userId,
        eventId,
      },
      attributes: ["type", "unbanDate"],
      raw: true,
    });
    return banUserInEvent;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Can not find user",
    });
  }
};

export default {
  // list,
  createBan,
  updateBan,
  getUserStatusInEvent,
};
