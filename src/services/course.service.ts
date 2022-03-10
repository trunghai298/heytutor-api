import { BadRequestError } from "../utils/errors";
import Course from "../models/course.model";

/**
 * To create a new course
 */
const addCourse = async (payload) => {
  try {
    const input = {
      id: payload.courseId,
      deptId: payload.deptId,
      courseName: payload.courseName,
      courseCode: payload.courseCode,
    };
    const res = await Course.create(input);
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
