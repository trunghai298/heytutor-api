import { BadRequestError } from "../utils/errors";
import UserPost from "../models/user-post.model";

/**
 * To create a new term
 */
const list = async (payload) => {
  try {
    const res = await UserPost.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  list,
};
