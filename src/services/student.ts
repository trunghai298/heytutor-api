import Student from "../models/student";
import { NotFoundError } from "../utils/errors";

const fetchById = async (id: number) => {
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
};

export default {
  fetchById,
};
