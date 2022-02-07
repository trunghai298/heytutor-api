import User from "../models/user";
import { NotFoundError } from "../utils/errors";

/**
 * To information of a user
 */
const getUserInfo = async (userId: number) => {
  try {
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
  } catch (error) {}
};

/**
 * To information of a user by email
 */
const fetchByEmail = async (email: string) => {
  try {
    const user = await User.findOne({
      where: { email },
      raw: true,
      // logging: console.log,
    });

    return user;
  } catch (error) {
    throw new NotFoundError({
      field: "email",
      message: "User is not found",
    });
  }
};

export default {
  getUserInfo,
  fetchByEmail,
};
