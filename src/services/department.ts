import { BadRequestError } from "../utils/errors";
import Department from "../models/department";

/**
 * To create a new department
 */
const addDept = async (payload) => {
  try {
    const input = {
      id: payload.deptId,
      termId: payload.termId,
      deptName: payload.deptName,
    };

    const res = await Department.create(input);
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  addDept,
};
