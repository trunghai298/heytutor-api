import { BadRequestError } from "../utils/errors";
import Bookmark from "../models/bookmark";

/**
 * To list of bookmarked posts by user
 */
const listBookmark = async (payload) => {
  try {
    const res = await Bookmark.findAll({ where: { userId: payload.userId } });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  listBookmark,
};
