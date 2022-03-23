import { BadRequestError } from "../utils/errors";
import Activity from "../models/activity.model";

/**
 * To create a new class
 */
export const list = async (ctx) => {
  try {
    const res = await Activity.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};
