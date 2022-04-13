import { BadRequestError, NotFoundError } from "../utils/errors";
import { Op } from "sequelize";
import { map } from "lodash";
import Report from "../models/report.model";
import Ban from "../models/ban.model";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import User from "../models/user.model";

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

    return "Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const createReport = async (ctx, payload) => {
  const reporterId = ctx?.user?.id;
  const { userId, postId, eventId, reason, content, commentId } = payload;

  try {
    if (reporterId !== userId) {
      const res = await Report.create({
        userId: userId,
        postId: postId,
        eventId: eventId,
        commentId: commentId,
        reason: reason,
        content: content,
        reporterId: reporterId,
      });
    }
    const user = await User.findOne({
      where: { userId },
      attributes: ["name"],
      raw: true,
    });

    const payload = {
      userId: userId,
      postId: postId,
      eventId: eventId,
      commentId: commentId,
      fromUserId: reporterId,
      fromUsername: user.name,
    };

    let results;
    if (postId === null && commentId === null) {
      results = {
        ...payload,
        notificationType: NOTI_TYPE.ReportUser,
      };
    } else if (postId !== null && commentId === null) {
      results = {
        ...payload,
        notificationType: NOTI_TYPE.ReportPost,
      };
    } else if (postId !== null && commentId !== null) {
      results = {
        ...payload,
        notificationType: NOTI_TYPE.ReportComment,
      };
    }

    await NotificationService.create(payload);
    return "Success!!!";
  } catch (error) {
    return error;
  }
};

const listReportNotResolvedByUser = async (userId) => {
  try {
    const res = Report.findAll({
      where: {
        userId,
        isResolved: 0,
      },
      raw: true,
    });

    return res;
  } catch (error) {
    return error;
  }
};

const listReportResolvedByUser = async (userId) => {
  try {
    const res = Report.findAll({
      where: {
        userId,
        isResolved: 1,
      },
      raw: true,
    });

    return res;
  } catch (error) {
    return error;
  }
};

const listAllReportOfUser = async (userId) => {
  try {
    const res = Report.findAll({
      where: {
        userId,
      },
      raw: true,
    });

    return res;
  } catch (error) {
    return error;
  }
};

export default {
  checkReportInDay,
  createReport,
  listReportNotResolvedByUser,
  listReportResolvedByUser,
  listAllReportOfUser,
};
