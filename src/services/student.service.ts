import Student from "../models/student.model";
import { NotFoundError, BadRequestError } from "../utils/errors";

const fetchById = async (id: number) => {
  try {
    const student = await Student.findOne({
      where: {
        id,
      },
    });

    if (!student) {
      throw new NotFoundError({
        field: "id",
        message: "Student is not found",
      });
    }

    return student;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Can not find this user.",
    });
  }
};

const list = async (limit, offset) => {
  try {
    const listStudent = await Student.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    return listStudent;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Something went wrong!.",
    });
  }
};

export default {
  fetchById,
  list,
};
