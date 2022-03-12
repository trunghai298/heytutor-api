import { BadRequestError } from "../utils/errors";
import Ranking from "../models/ranking.model";

/**
 * To get user's ranking
 */
const getUserRank = async (payload) => {
  try {
    const res = await Ranking.findOne({ where: { userId: payload.userId } });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  getUserRank,
};
