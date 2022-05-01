import { BadRequestError } from "../utils/errors";
import Class from "../models/class.model";
import { Sequelize } from "sequelize";

/**
 * To create a new class
 */
const addClass = async (payload) => {
  try {
    const input = {
      classId: payload.classId,
      courseId: payload.courseId,
      deptId: payload.deptId,
      className: payload.className,
    };
    const res = await Class.create(input);
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const list = async (limit, offset) => {
  try {
    const listData = await Class.findAndCountAll({
      limit: parseInt(limit, 10) || 1000,
      offset: parseInt(offset, 10) || 0,
    });
    return listData;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Something went wrong!.",
    });
  }
};

const count = async () => {
  try {
    const res = await Class.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("classId")), "classId"],
      ],
      raw: true,
      logging: true,
    });
    return res.length;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Something went wrong!.",
    });
  }
};

export default {
  addClass,
  list,
  count,
};
