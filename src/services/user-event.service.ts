import { BadRequestError } from "../utils/errors";
import UserEvent from "../models/user-event.model";

/**
 * To create a new term
 */
const list = async (payload) => {
  try {
    const res = await UserEvent.findAll({});
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
