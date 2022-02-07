import Student from "../models/student";
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

export default {
  fetchById,
};
