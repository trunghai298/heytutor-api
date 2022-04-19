import Student from "../models/student.model";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { map } from "lodash";

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

const getListSubjects = async (stdId: string) => {
  const studentSubject = await Student.findAll({
    attributes: ["stdId", "subject"],
    where: { stdId },
    group: ["subject"],
    raw: true,
  });

  return map(studentSubject, "subject");
};

const subjectGroupByMajor = async () => {
  try {
    const listMajors = await Student.findAll({
      attributes: ["major"],
      group: ["major"],
      raw: true,
    });

    const res = await Promise.all(
      map(listMajors, async (major) => {
        const listSubject = await Student.findAll({
          where: {
            major: major.major,
          },
          attributes: ["subject"],
          group: ["subject"],
          raw: true,
        });

        return {
          major: major.major,
          listSubjects: listSubject,
        };
      })
    );

    return res;
  } catch (error) {
    console.log(error);

    throw new BadRequestError({
      field: "error",
      message: "Something went wrong!.",
    });
  }
};

export default {
  getListSubjects,
  fetchById,
  list,
  subjectGroupByMajor,
};
