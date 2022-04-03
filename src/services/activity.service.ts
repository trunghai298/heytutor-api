import { create } from './comment.service';
import { BadRequestError } from "../utils/errors";
import Activity from "../models/activity.model";

/**
 * To create a new class
 */
const list = async (ctx) => {
  try {
    const res = await Activity.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const listActivities = async(userId) => {
  try {
    const res = await Activity.findAll({
      where: {
        userId,
      },
      order: ['createdAt', 'DESC'],
      raw: true,
    });
    return res;
  } catch (error) {
    return error;
  }
}

const createActivities = async(payload) => {
  const {userId, username, action, content} = payload;
  try {
    const res = await Activity.create({
      userId,
      username,
      action,
      content,
    });
    return "Success!";
  } catch (error) {
    return error;
  }
}

export default {
  listActivities,
  createActivities
}
