import { BadRequestError, NotFoundError } from "../utils/errors";
import { Op } from "sequelize";
import { map } from "lodash";
import Report from "../models/report.model";
import BanService from "./ban.service";
import Ban from "../models/ban.model";

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
  const { userId, postId, reason, content } = payload;

  try {
    if (reporterId !== userId) {
      const res = await Report.create({
        userId: userId,
        postId: postId,
        reason: reason,
        content: content,
        reporterId: reporterId,
      });
    }

    return "Success!!!";
  } catch (error) {
    return error;
  }
};

const listReportNotResolved = async (userId) => {
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

const listReportResolved = async (userId) => {
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

export default {
  checkReportInDay,
  createReport,
  listReportNotResolved,
  listReportResolved,
};
