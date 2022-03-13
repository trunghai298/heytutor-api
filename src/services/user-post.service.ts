import { BadRequestError } from "../utils/errors";
import UserPost from "../models/user-post.model";
import { Op } from "sequelize";

/**
 * To create a new term
 */
const list = async (payload) => {
  try {
    const res = await UserPost.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const createCondition = (type, userId) =>
  type === "myRequest"
    ? {
        userId: userId,
      }
    : {
        registerId: userId,
      };

const getNbOfAllPost = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);

    const res = await UserPost.findAll({
      where: condition,
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });

    return res.length;
  } catch (error) {
    console.log(error);
  }
};

const getNbOfPendingPost = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);
    const res = await UserPost.findAll({
      where: {
        ...condition,
        isPending: {
          [Op.eq]: 1,
        },
        isActive: {
          [Op.eq]: 0,
        },
        isDone: {
          [Op.eq]: 0,
        },
        isConfirmed: {
          [Op.eq]: 0,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getNbOfConfirmedPost = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);
    const res = await UserPost.findAll({
      where: {
        ...condition,
        isPending: {
          [Op.eq]: 0,
        },
        isActive: {
          [Op.eq]: 0,
        },
        isDone: {
          [Op.eq]: 0,
        },
        isConfirmed: {
          [Op.eq]: 1,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getNbOfActivePost = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);
    const res = await UserPost.findAll({
      where: {
        ...condition,
        isPending: {
          [Op.eq]: 0,
        },
        isActive: {
          [Op.eq]: 1,
        },
        isDone: {
          [Op.eq]: 0,
        },
        isConfirmed: {
          [Op.eq]: 0,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getNbOfDonePost = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);
    const res = await UserPost.findAll({
      where: {
        ...condition,
        isPending: {
          [Op.eq]: 0,
        },
        isActive: {
          [Op.eq]: 0,
        },
        isDone: {
          [Op.eq]: 1,
        },
        isConfirmed: {
          [Op.eq]: 0,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getNbOfOnEvent = async (type, userId) => {
  try {
    const condition = createCondition(type, userId);
    const res = await UserPost.findAll({
      where: {
        ...condition,
        eventId: {
          [Op.ne]: null,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getPostStats = async (ctx) => {
  // const { user } = ctx;
  const userId = ctx?.user?.id || 2;

  try {
    const nbOfAllPost = await getNbOfAllPost("myRequest", userId);
    const nbOfAllPostRegistered = await getNbOfAllPost("registered", userId);

    const nbOfPendingPost = await getNbOfPendingPost("myRequest", userId);
    const nbOfPendingPostRegistered = await getNbOfPendingPost(
      "registered",
      userId
    );

    const nbOfConfirmedPost = await getNbOfConfirmedPost("myRequest", userId);
    const nbOfConfirmedPostRegistered = await getNbOfConfirmedPost(
      "registered",
      userId
    );

    const nbOfActivePost = await getNbOfActivePost("myRequest", userId);
    const nbOfActivePostRegistered = await getNbOfActivePost(
      "registered",
      userId
    );

    const nbOfDonePost = await getNbOfDonePost("myRequest", userId);
    const nbOfDonePostRegistered = await getNbOfDonePost("registered", userId);

    const nbOfPostOnEvent = await getNbOfOnEvent("myRequest", userId);
    const nbOfPostRegisteredOnEvent = await getNbOfOnEvent(
      "registered",
      userId
    );

    return {
      myRequestStats: {
        nbOfAllPost,
        nbOfPendingPost,
        nbOfConfirmedPost,
        nbOfActivePost,
        nbOfDonePost,
        nbOfPostOnEvent,
      },
      myRegisterStats: {
        nbOfAllPost: nbOfAllPostRegistered,
        nbOfPendingPost: nbOfPendingPostRegistered,
        nbOfConfirmedPost: nbOfConfirmedPostRegistered,
        nbOfActivePost: nbOfActivePostRegistered,
        nbOfDonePost: nbOfDonePostRegistered,
        nbOfPostOnEvent: nbOfPostRegisteredOnEvent,
      },
    };
  } catch (error) {}
};

export default {
  list,
  getPostStats,
};
