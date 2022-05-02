import { Op } from "sequelize";
import Admin from "../models/admin.model";
import Event from "../models/event.model";
import ActivityServices from "./activity.service";
import Post from "../models/post.model";
import UserPost from "../models/user-post.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { map } from "lodash";
import EventService from "./event.service";
import { NOTI_TYPE } from "../constants/notification";
import NotificationService from "./notification.service";
import PinServices from "./pin.services";
import ReportService from "./report.service";
import UserPostService from "./user-post.service";
import generator from "generate-password";
import MailService from "./mail.service";
import Password from "./password.service";
import Report from "../models/report.model";

const createAdmin = async () => {
  const admin = await Admin.findOne({ where: { name: "root" }, raw: true });

  if (admin) {
    return admin;
  }

  return Admin.create({
    email: "admin@heytutor.com",
    name: "root",
    password: "root",
    role: "superadmin",
    permissions: "all",
  });
};

const addCollaborator = async (ctx, payload) => {
  const { email, name, role, address, phone, facebook } = payload;
  const { user } = ctx;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const admin = await Admin.findOne({
        where: { email },
        raw: true,
      });
      if (admin === null) {
        const password = generator.generate({
          length: 10,
          numbers: true,
        });

        await MailService.sendMailToCollaborator(email, password);

        const myEncryptPassword = await Password.Encrypt.cryptPassword(
          password
        );

        const res = await Admin.create({
          email,
          name,
          password: myEncryptPassword,
          role,
          address,
          phone,
          facebook,
          updatedBy: user.id,
          addBy: user.id,
        });

        const log = await ActivityServices.create({
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.NewCollab,
          content: `Quản trị viên ${user.name} thêm cộng tác viên mới ${name}`,
        });

        const id = await Admin.count();
        const payload = {
          userId: id,
          notificationType: NOTI_TYPE.NewCollab,
          fromUserId: user.id,
          fromUsername: user.name,
        };
        await NotificationService.create(payload);

        return {
          log,
        };
      } else {
        return {
          message: "Người dùng đã tồn tại.",
        };
      }
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không quyền thay đổi thông tin này.",
      });
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateCollaborator = async (ctx, payload) => {
  const { id, email, name, role, permission, address, phone, facebook } =
    payload;
  const { user } = ctx;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const res = await Admin.update(
        {
          name,
          role,
          permission,
          address,
          phone,
          facebook,
          updatedBy: user.id,
        },
        {
          where: {
            email,
          },
        }
      );
      const log = await ActivityServices.create({
        userId: user.id,
        username: user.name,
        action: NOTI_TYPE.UpdateCollab,
        content: `Quản trị viên ${user.name} sửa thông tin của cộng tác viên ${name}`,
      });

      const payload = {
        userId: id,
        notificationType: NOTI_TYPE.UpdateCollab,
        fromUserId: user.id,
        fromUsername: user.name,
      };
      await NotificationService.create(payload);
      return { status: 200 };
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền thay đổi thông tin này.",
      });
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

// const listAllCollaborator = async () => {
//   try {
//     const listCollaborator = await Admin.findAll({ raw: true });
//     return listCollaborator;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };

const listEventInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);
  try {
    const list = await Event.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });
    return list;
  } catch (error) {
    return error;
  }
};

const listPostInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);

  try {
    const list = await Post.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });

    return list;
  } catch (error) {
    return error;
  }
};

const listNewRegisterInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);
  try {
    const list = await UserPost.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });

    let tempArray = [];
    for (const array of list) {
      if (array.registerId !== null && array.registerId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.registerId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.registerId);
        }
      }
    }

    const listNewRegisterInXDays = [...new Set(tempArray)];

    return listNewRegisterInXDays;
  } catch (error) {
    return error;
  }
};

const systemDetailsInXDays = async (ctx, nbOfDays) => {
  const twoTimeNbOfDays = nbOfDays * 2;
  const { user } = ctx;

  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const listEventsInXDays = await listEventInXDays(0, nbOfDays);
      const nbEventInXDays = listEventsInXDays.length;
      const listPostsInXDays = await listPostInXDays(0, nbOfDays);
      const nbOfNewPostInXDays = listPostsInXDays.length;
      const listAllNewRegisterInXDays = await listNewRegisterInXDays(
        0,
        nbOfDays
      );
      const nbOfNewRegisterInXDays = listAllNewRegisterInXDays.length;

      const listEventInPreviousXDays = await listEventInXDays(
        nbOfDays,
        twoTimeNbOfDays
      );
      const nbEventInPreviousXDays = listEventInPreviousXDays.length;
      const listPostsInPreviousXDays = await listPostInXDays(
        nbOfDays,
        twoTimeNbOfDays
      );
      const nbOfNewPostInPreviousXDays = listPostsInPreviousXDays.length;
      const listAllNewRegisterInPreviousXDays = await listNewRegisterInXDays(
        nbOfDays,
        twoTimeNbOfDays
      );
      const nbOfNewRegisterInPreviousXDays =
        listAllNewRegisterInPreviousXDays.length;

      let percentXdaysEventChange = nbEventInXDays * 100;
      if (nbEventInPreviousXDays !== 0) {
        percentXdaysEventChange =
          ((nbEventInXDays - nbEventInPreviousXDays) / nbEventInPreviousXDays) *
          100;
      }

      let percentXdaysPostChange = nbOfNewPostInXDays * 100;
      if (nbOfNewPostInPreviousXDays !== 0) {
        percentXdaysPostChange =
          ((nbOfNewPostInXDays - nbOfNewPostInPreviousXDays) /
            nbEventInPreviousXDays) *
          100;
      }

      let percentXdaysRegisterChange = nbOfNewRegisterInXDays * 100;
      if (nbOfNewRegisterInPreviousXDays !== 0) {
        percentXdaysRegisterChange =
          ((nbOfNewRegisterInXDays - nbOfNewRegisterInPreviousXDays) /
            nbOfNewRegisterInPreviousXDays) *
          100;
      }

      return {
        nbEventInXDays,
        percentXdaysEventChange,
        nbOfNewPostInXDays,
        percentXdaysPostChange,
        nbOfNewRegisterInXDays,
        percentXdaysRegisterChange,
      };
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền truy cập thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy quản trị viên này.",
    });
  }
};

const listCollaborator = async (ctx) => {
  const { user } = ctx;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const listCollaborators = await Admin.findAll({
        where: {
          role: {
            [Op.like]: "ctv%",
          },
          // [Op.or]: [{ role: "ctv1" }, { role: "ctv2" }],
        },
        attributes: { exclude: ["password"] },
        raw: true,
      });

      const res = await Promise.all(
        map(listCollaborators, async (user) => {
          const nbOfPendingEvents =
            await EventService.countPendingEventOfCollaborator(user.id);

          const nbOfActiveEvents =
            await EventService.countActiveEventOfCollaborator(user.id);

          const nbOfUserInEvents =
            await EventService.countUserReportInEventOfCollaborator(user.id);

          const updateName = await Admin.findOne({
            where: {
              id: user.updatedBy,
            },
            attributes: ["name"],
            raw: true,
          });

          const collaboratorInfo = {
            userInfo: user,
            updateName: updateName.name,
            nbOfPendingEvents: nbOfPendingEvents.length,
            nbOfActiveEvents: nbOfActiveEvents.length,
            nbOfUserInEvents: nbOfUserInEvents,
          };

          return collaboratorInfo;
        })
      );

      return res;
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền truy cập thông tin này.",
      });
    }
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy quản trị viên này.",
    });
  }
};

const listPostManage = async (ctx) => {
  const { user } = ctx;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      // const listPinPost = await PinServices.getListPinPost();
      const listReportedPost = await ReportService.listReportedPost();
      // const listNoRegisterPost = await UserPostService.getListPostNoRegister();

      return {
        // listPinPost,
        listReportedPost,
        // listNoRegisterPost,
      };
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền truy cập thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy quản trị viên này.",
    });
  }
};

const collaboratorInfo = async (ctx, userId) => {
  const { user } = ctx;
  try {
    if (user.role === "Admin" || user.role === "superadmin") {
      const res = await Admin.findOne({
        where: {
          id: userId,
        },
        attributes: { exclude: ["password"] },
        raw: true,
      });

      const updatedName = await Admin.findOne({
        where: {
          id: res.addBy,
        },
        attributes: ["name"],
        raw: true,
      });

      return { ...res, adminAddedName: updatedName.name };
    } else if (user.role !== "Admin" && user.role !== "superadmin") {
      throw new BadRequestError({
        field: "adminId",
        message: "Bạn không có quyền truy cập thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "adminId",
      message: "Không tìm thấy quản trị viên này.",
    });
  }
};

// const listAllActivityRelatedToReport = async (ctx, reportId) => {
//   const { user } = ctx;
//   try {
//     if (user.role === "Admin" || user.role === "superadmin") {
//       const reportDetail = await Report.findOne({
//         where: {
//           reportId,
//         },
//         raw: true,
//       });


//     } else if (user.role !== "Admin" && user.role !== "superadmin") {
//       throw new BadRequestError({
//         field: "adminId",
//         message: "Bạn không có quyền truy cập thông tin này.",
//       });
//     }
//   } catch (error) {
//     throw new NotFoundError({
//       field: "reportId",
//       message: "Không tìm thấy báo cáo xấu.",
//     });
//   }
// };

export default {
  createAdmin,
  addCollaborator,
  updateCollaborator,
  // listAllCollaborator,
  systemDetailsInXDays,
  listCollaborator,
  listPostManage,
  collaboratorInfo,
};
