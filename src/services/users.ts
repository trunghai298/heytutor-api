import Student from "../models/student";
import User from "../models/user";
import { NotFoundError } from "../utils/errors";

/**
 * To information of a user
 */
const getUserProfileById = async (userId: any) => {
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: {
        exclude: ["password"],
      },
      logging: console.log,
      raw: true,
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
  getUserProfileById,
  fetchByEmail,
};
