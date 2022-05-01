import { map } from "lodash";
import UserEvent from "../models/user-event.model";
import User from "../models/user.model";
import Ban from "../models/ban.model";
import Event from "../models/event.model";
import UserPermission from "../models/user-permission.model";
import { BadRequestError } from "../utils/errors";
const { Op } = require("sequelize");
import { NOTI_TYPE } from "../constants/notification";
import NotificationService from "./notification.service";
import ActivityServices from "./activity.service";

//Run first time to get all permission.
const initPermission = async () => {
  try {
    const listUser = await User.findAll({
      attributes: ["id"],
      raw: true,
    });

    const userPermission = await Promise.all(
      map(listUser, async (user) => {
        const payload = {
          userId: user.id,
          canPost: 1,
          canRegister: 1,
          canComment: 1,
          eventId: null,
        };

        await createPermission(payload);
      })
    );

    const listUserEvent = await UserEvent.findAll({
      attributes: ["userId", "eventId"],
      raw: true,
    });

    const eventPermission = await Promise.all(
      map(listUserEvent, async (userEvent) => {
        const payload = {
          userId: userEvent.userId,
          canPost: 1,
          canRegister: 1,
          canComment: 1,
          eventId: userEvent.eventId,
        };

        await createPermission(payload);
      })
    );

    const log = await ActivityServices.create({
      userId: 5,
      username: "superadmin",
      action: NOTI_TYPE.InitPermission,
      content: "Quản trị viên cấp cao cấp quyền hạn mặc định cho tất cả người dùng.",
    });
  } catch (error) {
    return error;
  }
};

const checkUserCreatePostPermission = async (userId, eventId) => {
  try {
    const canPost = await UserPermission.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
      attributes: ["canPost"],
      raw: true,
    });

    if (canPost.canPost === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

const checkUserRegisterPermission = async (userId, eventId) => {
  try {
    const canPost = await UserPermission.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
      attributes: ["canRegister"],
      raw: true,
    });

    if (canPost.canRegister === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

const checkUserCommentPermission = async (userId, eventId) => {
  try {
    const canPost = await UserPermission.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
      attributes: ["canRegister"],
      raw: true,
    });

    if (canPost.canComment === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

// Run every 2 hours
const checkEventPermission = async () => {
  const today = new Date(Date.now());

  try {
    const listEvent = await Event.findAll({
      where: {
        endAt: {
          [Op.lt]: today,
        },
      },
      attributes: ["id"],
      raw: true,
    });

    const res = await Promise.all(
      map(listEvent, async (event) => {
        await UserPermission.update(
          {
            canPost: 0,
            canRegister: 0,
            canComment: 0,
          },
          {
            where: {
              eventId: event.id,
            },
          }
        );
      })
    );

    const log = await ActivityServices.create({
      userId: 5,
      username: "superadmin",
      action: NOTI_TYPE.CheckEventPermission,
      content: `Quản trị viên cấp cao thay đổi quyền cho tất cả người dùng trong các sự kiện ${listEvent} vào lúc ${today}`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "",
      message: error,
    });
  }
};

const createPermission = async (payload) => {
  const { userId, canPost, canRegister, canComment, eventId } = payload;
  try {
    await UserPermission.create({
      userId: userId,
      canPost: canPost,
      canRegister: canRegister,
      canComment: canComment,
      eventId: eventId,
    });

    const log = await ActivityServices.create({
      userId: 5,
      username: "superadmin",
      action: NOTI_TYPE.NewPermission,
      content: `SuperAdmin change permission for userId ${userId} in event ${eventId}`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "eventId-userId",
      message: "Có lỗi khi thực hiện tạo quyền.",
    });
  }
};

// const checkBan = async () => {
//   const thirtyMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
//   const currentTime = new Date(Date.now());
//   try {
//     const listBan = await Ban.findAll({
//       where: {
//         banDate: {
//           [Op.gt]: thirtyMinutesAgo,
//           [Op.lt]: currentTime,
//         },
//       },
//       raw: true,
//     });

//     const res = await Promise.all(
//       map(listBan, async (ban) => {
//         if (
//           ban.type === "1-1" ||
//           ban.type === "1-2" ||
//           ban.type === "1-3" ||
//           ban.type === "1-4"
//         ) {
//           const permission = await UserPermission.update(
//             {
//               canPost: 0,
//             },
//             {
//               where: {
//                 userId: ban.userId,
//                 eventId: ban.eventId,
//               },
//             }
//           );

//           const payload = {
//             userId: ban.userId,
//             notificationType: NOTI_TYPE.UpdateBanPost,
//             fromUser: 5,
//             fromUserName: "Trung Hai",
//           };
//           await NotificationService.create(payload);
//         } else if (
//           ban.type === "2-1" ||
//           ban.type === "2-2" ||
//           ban.type === "2-3" ||
//           ban.type === "2-4"
//         ) {
//           const permission = await UserPermission.update(
//             {
//               canRegister: 0,
//             },
//             {
//               where: {
//                 userId: ban.userId,
//                 eventId: ban.eventId,
//               },
//             }
//           );

//           const payload = {
//             userId: ban.userId,
//             notificationType: NOTI_TYPE.BanRegister,
//             fromUser: 5,
//             fromUserName: "Trung Hai",
//           };
//           await NotificationService.create(payload);
//         } else if (
//           ban.type === "3-1" ||
//           ban.type === "3-2" ||
//           ban.type === "3-3" ||
//           ban.type === "3-4"
//         ) {
//           const permission = await UserPermission.update(
//             {
//               canComment: 0,
//             },
//             {
//               where: {
//                 userId: ban.userId,
//                 eventId: ban.eventId,
//               },
//             }
//           );

//           const payload = {
//             userId: ban.userId,
//             notificationType: NOTI_TYPE.BanComment,
//             fromUser: 5,
//             fromUserName: "Trung Hai",
//           };
//           await NotificationService.create(payload);
//         }
//       })
//     );

//     return { status: 200 };
//   } catch (error) {
//     console.log(error);

//     throw new BadRequestError({
//       field: "id",
//       message: "Failed to create this item.",
//     });
//   }
// };

const checkUnBan = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const currentTime = new Date(Date.now());
  try {
    const listBan = await Ban.findAll({
      where: {
        unbanDate: {
          [Op.gt]: thirtyMinutesAgo,
          [Op.lt]: currentTime,
        },
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listBan, async (ban) => {
        if (ban.type.includes("1-")) {
          const permission = await UserPermission.update(
            {
              canPost: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );

          const log = await ActivityServices.create({
            userId: 5,
            userName: "superadmin",
            action: NOTI_TYPE.UpdateBanPost,
            content: `Thay đổi quyền tạo vấn đề cho người dùng ${ban.userId} trong sự kiện ${ban.eventId}`,
          });

          const payload = {
            userId: ban.userId,
            notificationType: NOTI_TYPE.UnBanPost,
            eventId: ban.eventId,
            fromUser: 5,
            fromUserName: "Trung Hai",
          };
          await NotificationService.create(payload);
        } else if (ban.type.includes("2-")) {
          const permission = await UserPermission.update(
            {
              canRegister: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );

          const log = await ActivityServices.create({
            userId: 5,
            userName: "superadmin",
            action: NOTI_TYPE.UpdateBanRegister,
            content: `Thay đổi quyền đăng kí cho người dùng ${ban.userId} trong sự kiện ${ban.eventId}`,
          });

          const payload = {
            userId: ban.userId,
            notificationType: NOTI_TYPE.UnBanRegister,
            eventId: ban.eventId,
            fromUser: 5,
            fromUserName: "Trung Hai",
          };
          await NotificationService.create(payload);
        } else if (ban.type.includes("3-")) {
          const permission = await UserPermission.update(
            {
              canComment: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );

          const log = await ActivityServices.create({
            userId: 5,
            userName: "superadmin",
            action: NOTI_TYPE.UpdateBanComment,
            content: `Thay đổi quyền bình luận cho người dùng ${ban.userId} trong sự kiện ${ban.eventId}`,
          });

          const payload = {
            userId: ban.userId,
            notificationType: NOTI_TYPE.UnBanComment,
            eventId: ban.eventId,
            fromUser: 5,
            fromUserName: "Trung Hai",
          };
          await NotificationService.create(payload);
        }
      })
    );

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "",
      message: error,
    });
  }
};

export default {
  // checkBan,
  checkUnBan,
  initPermission,
  createPermission,
  checkEventPermission,
  checkUserCreatePostPermission,
  checkUserRegisterPermission,
  checkUserCommentPermission,
};
