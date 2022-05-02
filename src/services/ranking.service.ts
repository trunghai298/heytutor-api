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
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const getTop10User = async (ctx) => {
  const { user } = ctx;
  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const res = await Ranking.findAll({
        limit: 10,
        order: [["rankPoint", "DESC"]],
        raw: true,
      });

      return res;
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyên truy cập thông tin này",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy quản trị viên.",
    });
  }
};

const reCalculatePoint = async (payload) => {
  const { receiverId, score, type } = payload;

  try {
    const rankPointInfo = await Ranking.findOne({
      where: { userId: receiverId },
      raw: true,
    });


    if (type === 1) {
      const newVoteCount = rankPointInfo.voteCount + 1;

      const newRankScore =
        (rankPointInfo.rankPoint * rankPointInfo.voteCount + score) /
        newVoteCount;

      let newCreditPoint;
      if (score >= 1 && score < 2) {
        newCreditPoint = rankPointInfo.creditPoint - 0.5;
      } else if (score >= 2 && score < 3) {
        newCreditPoint = rankPointInfo.creditPoint - 0.25;
      } else if (score >= 3 && score < 4) {
        newCreditPoint = rankPointInfo.creditPoint + 0.25;
      } else if (score >= 4 && score < 5) {
        newCreditPoint = rankPointInfo.creditPoint + 0.5;
      } else if (score === 5) {
        newCreditPoint = rankPointInfo.creditPoint + 1;
      }

      const res = await Ranking.update(
        {
          rankPoint: newRankScore,
          voteCount: newVoteCount,
          creditPoint: newCreditPoint,
        },
        {
          where: {
            userId: receiverId,
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
            userId: receiverId,
          },
        }
      );
      return { status: 200 };
    }
  } catch (error) {
    throw new BadRequestError({
      field: "payload",
      message: "Dữ liệu truyền vào sai.",
    });
  }
};

export default {
  getUserRank,
  getTop10User,
  reCalculatePoint,
};
