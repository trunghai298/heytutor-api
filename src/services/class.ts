import { BadRequestError } from "../utils/errors";
import Class from "../models/class";

/**
 * To create a new class
 */
const addClass = async (payload) => {
  try {
    const res = await Class.create(payload);
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  addClass,
};
