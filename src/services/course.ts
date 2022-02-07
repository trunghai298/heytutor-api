import { BadRequestError } from "../utils/errors";
import Course from "../models/course";

/**
 * To create a new course
 */
const addCourse = async (payload) => {
  try {
    const res = await Course.create(payload);
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  addCourse,
};
