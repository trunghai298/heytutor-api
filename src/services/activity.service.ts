import { BadRequestError } from "../utils/errors";
import Activity from "../models/activity.model";

/**
 * To create a new class
 */
export const list = async (limit, offset) => {
  try {
    const res = await Activity.findAll({
      limit: parseInt(limit) || 3,
      offset: parseInt(offset) || 0,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};
