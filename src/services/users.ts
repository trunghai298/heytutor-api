import User from "../models/user";
import { NotFoundError } from "../utils/errors";

const getUserInfo = async (userId: number) => {
  const user = await User.findOne({
    where: {
      id: userId,
    },
    attributes: {
      exclude: ["password"],
    },
  });

  if (!user) {
    throw new NotFoundError({
      field: "id",
      message: "User is not found",
    });
  }

  return user;
};

const fetchByEmail = async (email: string) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError({
      field: "email",
      message: "User is not found",
    });
  }

  return user;
};

export default {
  getUserInfo,
  fetchByEmail,
};
