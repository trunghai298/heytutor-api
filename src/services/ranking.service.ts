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

const top5User = async () => {
  try {
    const topUser = await Ranking.findAll({
      limit: 5,
      order: [
        ['rankPoint', 'DESC'],
        ['voteCount', 'DESC'],
      ]
    });
    return topUser
  } catch (error) {
    return (error);
  }
};

export default {
  getUserRank,
  top5User,
};
