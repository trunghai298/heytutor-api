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
    console.log(error);

    throw new BadRequestError({
      field: "id",
      message: "Cannot find user.",
    });
  }
};

export default {
  getUserRank,
  getTop10User,
};
