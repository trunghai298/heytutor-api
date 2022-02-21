import User from "../models/user";
import { NotFoundError } from "../utils/errors";
import { BadRequestError } from "../utils/errors";
import * as JWTUtils from "../utils/jwt";
import { compare, encrypt } from "../utils/bcrypt";

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
      field: "password",
      message: "Credentials are invalid",
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

  delete userDB.password;

  const token = await JWTUtils.sign({
    ...ctx,
    user: userDB,
  });

  return { token, user: userDB };
};
