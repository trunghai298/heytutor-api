import { BadRequestError } from "../utils/errors";
import Activity from "../models/activity.model";

/**
 * To create a new class
 */
export const list = async (limit, offset) => {
  try {
    const res = await Activity.findAll({
      limit: parseInt(limit) || 3,
      offset: parseInt(offset) || 0,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const create = async (payload) => {
  try {
    const res = await Activity.create({
      ...payload,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: error,
    });
  }
};

const getActivitiesOfUser = async (ctx, filter) => {
  const {user} = ctx;
  try {
    const res = await Activity.findAll({
      where: { 
        userId: user.id,
        filter,
      },
      raw: true,
      order: [
        ['createdAt', 'DESC']
      ]
    });

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Cannot find user!!!",
    });
  }
};

export default {
  list,
  create,
  getActivitiesOfUser,
};
