import { BadRequestError, NotFoundError } from "../utils/errors";
import { Op } from "sequelize";
import { map, compact } from "lodash";
import Report from "../models/report.model";
import Ban from "../models/ban.model";
import Events from "../models/event.model";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import User from "../models/user.model";
import Post from "../models/post.model";
import Admin from "../models/admin.model";
import ActivityServices from "./activity.service";

const checkReportInDay = async () => {
  const lastMidnight = new Date();
  lastMidnight.setHours(0, 0, 0, 0);
  const currentTime = new Date(Date.now());

  try {
    const reports = await Report.findAll({
      where: {
        createdAt: {
          [Op.gt]: lastMidnight,
          [Op.lt]: currentTime,
        },
      },
      attributes: ["userId", "postId"],
      raw: true,
    });

    const countReports = Promise.all(
      map(reports, async (report) => {
        const number = await Report.count({
          where: {
            userId: report.userId,
            postId: null,
            createdAt: {
              [Op.gt]: lastMidnight,
              [Op.lt]: currentTime,
            },
          },
        });

        if (number >= 3) {
          const res = await Ban.create({
            userId: report.userId,
            type: "2-2",
            banDate: currentTime,
            unbanDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            banBy: 0,
            eventId: null,
          });
        }
      })
    );

    const countReports1 = Promise.all(
      map(reports, async (report) => {
        const number = await Report.count({
          where: {
            userId: report.userId,
            postId: report.postId,
            createdAt: {
              [Op.gt]: lastMidnight,
              [Op.lt]: currentTime,
            },
          },
        });

        if (number >= 3) {
          const res = await Ban.create({
            userId: report.userId,
            type: "1-2",
            banDate: currentTime,
            unbanDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            banBy: 0,
            eventId: null,
          });
        }
      })
    );

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: ".",
    });
  }
};

const createReport = async (ctx, payload) => {
  const { reporter } = ctx;
  const { userId, postId, eventId, reason, content, commentId } = payload;

  try {
    if (reporter.id !== userId) {
      const res = await Report.create({
        userId: userId,
        postId: postId,
        eventId: eventId,
        commentId: commentId,
        reason: reason,
        content: content,
        reporterId: reporter.id,
      });
    }

    const payload = {
      userId: userId,
      postId: postId,
      eventId: eventId,
      commentId: commentId,
      fromUserId: reporter.id,
      fromUsername: reporter.name,
    };

    let results;
    let notiType;
    if (postId === null && commentId === null) {
      notiType = NOTI_TYPE.ReportUser;
      results = {
        ...payload,
        notificationType: notiType,
      };
    } else if (postId !== null && commentId === null) {
      notiType = NOTI_TYPE.ReportPost;
      results = {
        ...payload,
        notificationType: notiType,
      };
    } else if (postId !== null && commentId !== null) {
      notiType = NOTI_TYPE.ReportComment;
      results = {
        ...payload,
        notificationType: notiType,
      };
    }

    await NotificationService.create(results);

    const log = await ActivityServices.create({
      userId: reporter.id,
      username: reporter.name,
      action: notiType,
      content: `Người dùng ${reporter.id} tạo báo cáo xấu cho người dùng ${userId} về nội dung ${notiType}`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Có lỗi khi tạo báo cáo xấu.",
    });
  }
};

const listReportNotResolvedByUser = async (userId, eventId) => {
  try {
    const listReport = await Report.findAll({
      where: {
        userId,
        eventId,
        isResolved: 0,
      },
      raw: true,
    });

console.log(listReport);


    const reportDetail = await Promise.all(
      map(listReport, async (report) => {
        const postTitle = await Post.findOne({
          where: {
            id: report.postId,
          },
          attributes: ["title"],
          raw: true,
        });
        const reportedName = await User.findOne({
          where: {
            id: report.reportedBy,
          },
          attributes: ["name"],
          raw: true,
        });

        return {
          ...report,
          postTitle: postTitle.title,
          reportedName: reportedName.name,
        };
      })
    );

    const userInfo = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ["name", "id"],
      raw: true,
    });

    // const eventTitle = await Events.findOne({
    //   where: {
    //     id: eventId,
    //   },
    //   raw: true,
    // });

    return {
      userInfo,
      // eventTitle,
      reportDetail,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng",
    });
  }
};

const listReportResolvedByUser = async (userId, eventId) => {
  try {
    const listReport = await Report.findAll({
      where: {
        userId,
        eventId,
        isResolved: 1,
      },
      raw: true,
    });

    const reportDetails = await Promise.all(
      map(listReport, async (report) => {
        const adminUpdate = await Admin.findOne({
          where: {
            id: report.resolvedBy,
          },
          attributes: ["name"],
          raw: true,
        });

        return {
          ...report,
          adminUpdate: adminUpdate.name,
        };
      })
    );

    const userInfo = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ["name"],
      raw: true,
    });

    const eventTitle = await Events.findOne({
      where: {
        id: eventId,
      },
      raw: true,
    });

    return {
      userInfo,
      eventTitle,
      reportDetails,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listReportOfUser = async (userId, eventId) => {
  try {
    const listReportNotResolved = await listReportNotResolvedByUser(
      userId,
      eventId
    );

    const listReportResolved = await listReportResolvedByUser(userId, eventId);

    return {
      listReportNotResolved: listReportNotResolved,
      listReportResolved: listReportResolved,
    };
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listReportNotResolved = async (ctx) => {
  const userId = ctx?.user?.id;
  try {
    const adminRole = Admin.findOne({
      where: {
        id: userId,
      },
      attributes: ["role"],
      raw: true,
    });

    if (adminRole.role === "superadmin" || adminRole.role === "Admin") {
      const res = await Report.findAll({
        where: {
          isResolved: 0,
        },
        raw: true,
      });

      return res;
    } else if (adminRole.role !== "superadmin" && adminRole.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền truy cập vào thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listReportResolved = async (ctx) => {
  const userId = ctx?.user?.id;
  try {
    const adminRole = Admin.findOne({
      where: {
        id: userId,
      },
      attributes: ["role"],
      raw: true,
    });

    if (adminRole.role === "superadmin" || adminRole.role === "Admin") {
      const res = await Report.findAll({
        where: {
          isResolved: 1,
        },
        raw: true,
      });

      return res;
    } else if (adminRole.role !== "superadmin" && adminRole.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền truy cập vào thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listAllReportOfUser = async (userId) => {
  try {
    const res = await Report.findAll({
      where: {
        userId,
      },
      raw: true,
    });

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listReportInEvent = async (eventId) => {
  try {
    const listReport = await Report.findAll({
      where: {
        eventId,
      },
    });

    return listReport;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện.",
    });
  }
};

const listReportedPost = async () => {
  try {
    const listReportedPost = await Report.findAll({
      where: {
        postId: {
          [Op.ne]: null,
        },
        isResolved: 0,
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listReportedPost, async (report) => {
        const postDetail = await Post.findOne({
          where: {
            id: report.postId,
          },
          raw: true,
        });
        if (report.eventId !== null) {
          const eventDetail = await Events.findOne({
            where: {
              id: report.eventId,
            },
            attributes: ["title", "description"],
            raw: true,
          });

          return { ...report, ...postDetail, ...eventDetail };
        } else if (report.eventId === null) {
          return { ...report, ...postDetail };
        }
      })
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "id",
      message: "Không tìm thấy vấn đề.",
    });
  }
};

const resolvedSimilarReport = async (
  adminId,
  userId,
  eventId,
  postId,
  commentId
) => {
  try {
    const listReportSimilar = await Report.findAll({
      where: {
        userId,
        eventId,
        postId,
        commentId,
      },
      attributes: ["id"],
      raw: true,
    });

    const res = await Promise.all(
      map(listReportSimilar, async (report) => {
        const update = await Report.update(
          {
            isResolved: 1,
            resolvedBy: adminId,
          },
          {
            where: {
              id: report.id,
            },
          }
        );
      })
    );

    return { status: 200 };
  } catch (error) {
    throw new NotFoundError({
      field: "id",
      message: "Không tìm thấy báo cáo xấu.",
    });
  }
};

export default {
  checkReportInDay,
  createReport,
  listReportNotResolvedByUser,
  listReportResolvedByUser,
  listAllReportOfUser,
  listReportInEvent,
  listReportedPost,
  listReportResolved,
  listReportNotResolved,
  listReportOfUser,
  resolvedSimilarReport,
};
