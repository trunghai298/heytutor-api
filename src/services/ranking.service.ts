import { BadRequestError } from "../utils/errors";
import Ranking from "../models/ranking.model";

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

const getTop10User = async () => {
  try {
    const res = await Ranking.findAll({
      limit: 10,
      order: [["rankPoint", "DESC"]],
      raw: true,
    });

    return res;
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
