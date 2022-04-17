import User from "../models/user.model";
import { NotFoundError } from "../utils/errors";
import { BadRequestError } from "../utils/errors";
import * as JWTUtils from "../utils/jwt";
import { compare, encrypt } from "../utils/bcrypt";
import Student from "../models/student.model";
import StudentServices from "../services/student.service";
import Admin from "../models/admin.model";

export const anonymous = async (ctx: any) => JWTUtils.sign({ ctx });

export const login = async (params: any, ctx: any) => {
  const { email, password } = params;

  if (!email || !password) {
    throw new BadRequestError({
      field: "email",
      message: "Email and password is required",
    });
  }

  const userDB = await User.findOne({
    where: { email },
    raw: true,
  });

  if (!userDB) {
    throw new NotFoundError({
      field: "user",
      message: "User not found !",
    });
  }

  const isSamePassword = password === userDB.password;
  // await compare(password, userDB.password);
  if (!isSamePassword) {
    throw new BadRequestError({
      field: "password",
      message: "Password is not correct",
    });
  }

  const studentData = await Student.findOne({
    attributes: ["fullName", "major", "stdCode"],
    where: { stdId: userDB.stdId },
    raw: true,
  });

  const subjectData = await StudentServices.getListSubjects(userDB.stdId);

  const attachStudentData = {
    ...userDB,
    ...studentData,
    subjects: JSON.stringify(subjectData),
  };

  delete attachStudentData.password;

  const token = await JWTUtils.sign({
    ...ctx,
    user: attachStudentData,
  });

  return { token };
};

export const adminLogin = async (params: any) => {
  const { email, password } = params;

  const admin = await Admin.findOne({
    where: { email },
    raw: true,
  });

  if (!admin) {
    throw new BadRequestError({
      field: "email",
      message: "User is not exist",
    });
  }

  const isSamePassword = password === admin.password;

  if (!isSamePassword) {
    throw new BadRequestError({
      field: "password",
      message: "Password is not correct",
    });
  }

  const token = await JWTUtils.sign({
    user: admin,
  });

  return { token };
};
