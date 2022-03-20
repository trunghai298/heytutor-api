import { BadRequestError } from "../utils/errors";
import Admin from "../models/admin.model";

/**
 * To create a new class
 */
export const fetch = async (ctx) => {
  try {
    const userId = ctx?.user?.id;
    const res = await Admin.findOne({ where: { id: userId } });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};
