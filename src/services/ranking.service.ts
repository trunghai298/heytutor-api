import { BadRequestError } from "../utils/errors";
import Ranking from "../models/ranking.model";
import Admin from "../models/admin.model";

/**
 * To get user's ranking
 */
const getUserRank = async (userId) => {
  try {
    const res = await Ranking.findOne({
      where: { userId: userId },
      attributes: [
        "rankPoint",
        "voteCount",
        "requestPoint",
        "requestVoteCount",
      ],
      raw: true,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const getTop10User = async (ctx) => {
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
      const res = await Ranking.findAll({
        limit: 10,
        order: [["rankPoint", "DESC"]],
        raw: true,
      });

      return res;
    } else if (adminRole.role !== "superadmin" && adminRole.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "You dont have permission to access this information",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Cannot find user.",
    });
  }
};

const reCalculatePoint = async (payload) => {
  const { userId, score, type } = payload;
  try {
    const rankPointInfo = await Ranking.findOne({
      where: { userId: userId },
      raw: true,
    });
    if (type === 1) {
      const newVoteCount = rankPointInfo.voteCount + 1;

      const newRankScore =
        (rankPointInfo.rankPoint * rankPointInfo.voteCount + score) /
        newVoteCount;

      const res = await Ranking.update(
        {
          rankPoint: newRankScore,
          voteCount: newVoteCount,
        },
        {
          where: {
            userId: userId,
          },
        }
      );

      return { status: 200 };
    } else if (type === 2) {
      const newVoteCount = rankPointInfo.requestVoteCount + 1;

      const newRequestPoint =
        (rankPointInfo.requestPoint * rankPointInfo.requestVoteCount + score) /
        newVoteCount;

      const res = await Ranking.update(
        {
          requestPoint: newRequestPoint,
          requestVoteCount: newVoteCount,
        },
        {
          where: {
            userId: userId,
          },
        }
      );
      
      return { status: 200 };
    }
  } catch (error) {}
};

export default {
  getUserRank,
  getTop10User,
  reCalculatePoint,
};
