import { BadRequestError } from "../utils/errors";
import Ban from "../models/ban.model";

/**
 * To create a new class
 */
export const list = async (ctx) => {
  try {
    const res = await Ban.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};
