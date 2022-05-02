import User from "../models/user.model";
import Post from "../models/post.model";
import { NotFoundError } from "../utils/errors";
import Ranking from "../models/ranking.model";
import UserPost from "../models/user-post.model";
import { filter } from "lodash";
import Admin from "../models/admin.model";
import Event from "../models/event.model";
import { Op } from "sequelize";
import { map } from "lodash";
import UserEvent from "../models/user-event.model";
import FeedbackService from "./feedback.service";
import { BadRequestError } from "../utils/errors";

/**
 * To information of a user
 */
const getUserInfoById = async (userId, limit, offset) => {
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: {
        exclude: ["password"],
      },
      raw: true,
    });

    const feedbackHistory = await FeedbackService.feedbackByUser(userId, limit, offset);
    // const userRanking = await Ranking.findOne({
    //   where: { userId },
    //   raw: true,
    // });

    // const userPostStats = await UserPost.findAll({
    //   where: {
    //     userId,
    //   },
    //   raw: true,
    // });

    // const nbTotalPost = userPostStats.length || 0;
    // const nbDonePost =
    //   filter(userPostStats, (post) => post.isDone === 1).length || 0;

    if (!user) {
      throw new NotFoundError({
        field: "id",
        message: "Không tìm thấy người dùng.",
      });
    }

    return {
      ...user,
      feedbackHistory,
      // voteCount: userRanking.voteCount,
      // rankPoint: userRanking.rankPoint,
      // nbTotalPost,
      // nbDonePost,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * To information of a user by email
 */
const fetchByEmail = async (email) => {
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
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get user's request's count number of user
 */
const totalRequestNumber = async (userId: number) => {
  try {
    const numberRequest = await Post.count({
      where: { userId },
    });

    return numberRequest;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get total subject in request of user by userId
 */
const getTotalSubject = async (userId: number) => {
  try {
    const subject = await Post.findAll({
      where: { userId },
      group: ["hashtag"],
      attributes: ["hashtag"],
      raw: true,
    });

    return subject;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get number of request in resolved status of user
 */
const getNumberOfRequestResolved = async (_userId: number) => {
  try {
    const listStatus = await Post.count({
      where: { userId: _userId, isResolved: 1 },
      raw: true,
      // logging: true,
    });

    return listStatus;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get number of request in pending status of user
 */
const getNumberOfRequestPending = async (_userId: number) => {
  try {
    const listStatus = await Post.count({
      where: { userId: _userId, isPending: 1 },
      raw: true,
      // logging: true,
    });

    return listStatus;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get number of request in active status of user
 */
const getNumberOfRequestActive = async (_userId: number) => {
  try {
    const listStatus = await Post.count({
      where: { userId: _userId, isActive: 1 },
      // logging: true,
    });

    return listStatus;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

/**
 * Get number of request by status of user
 */

const getUserPostStats = async (_userId: number) => {
  try {
    const [
      requestCount,
      totalRequestCount,
      requestResolvedCount,
      requestPendingCount,
      requestActiveCount,
    ] = await Promise.all([
      totalRequestNumber(_userId),
      getTotalSubject(_userId),
      getNumberOfRequestResolved(_userId),
      getNumberOfRequestPending(_userId),
      getNumberOfRequestActive(_userId),
    ]);
    return {
      requestCount,
      totalRequestCount,
      requestResolvedCount,
      requestPendingCount,
      requestActiveCount,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

// const totalNumberSubscribeOfSupporter = async (_userId: number) => {
//   try {
//     Subscribe.count({
//       where: {
//         subscribeId: {
//           [Op.like]: _userId,
//         },
//       },
//     });
//   } catch (error) {
//     throw new NotFoundError({
//       field: "userId",
//       message: "User is not found",
//     });
//   }
// };

const totalNumberConfirmedOfSupporter = async (_userId: number) => {
  try {
    Post.count({
      where: {
        supporterCF: _userId,
      },
    });
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

// const totalNumberPendingOfSupporter = async (_userId: number) => {
//   try {
//     Subscribe.hasMany(Post, { foreignKey: "id " });
//     Post.belongsTo(Subscribe, { foreignKey: "requestId" });

//     Post.count({
//       where: {
//         subscriberId: {
//           [Op.like]: _userId.toString(),
//         },
//         isPending: 1,
//       },
//     });
//   } catch (error) {
//     throw new NotFoundError({
//       field: "userId",
//       message: "User is not found",
//     });
//   }
// };

// const totalNumberActiveOfSupporter = async (_userId: number) => {
//   try {
//     Subscribe.hasMany(Post, { foreignKey: "id " });
//     Post.belongsTo(Subscribe, { foreignKey: "requestId" });

//     Post.count({
//       where: {
//         subscriberId: {
//           [Op.like]: _userId.toString(),
//         },
//         isActive: 1,
//       },
//     });
//   } catch (error) {
//     throw new NotFoundError({
//       field: "userId",
//       message: "User is not found",
//     });
//   }
// };

// const totalNumberResolvedOfSupporter = async (_userId: number) => {
//   try {
//     Subscribe.hasMany(Post, { foreignKey: "id " });
//     Post.belongsTo(Subscribe, { foreignKey: "requestId" });

//     Post.count({
//       where: {
//         subscriberId: {
//           [Op.like]: _userId.toString(),
//         },
//         isResolved: 1,
//       },
//     });
//   } catch (error) {
//     throw new NotFoundError({
//       field: "userId",
//       message: "User is not found",
//     });
//   }
// };

/**
 *
 * @param _userId
 * @returns total confirmed post number of one supporter
 */
const getSupporterStats = async (_userId: number) => {
  try {
    const [
      // totalRequestCount,
      requestConfirmedCount,
      // requestResolvedCount,
      // requestPendingCount,
      // requestActiveCount,
    ] = await Promise.all([
      // totalNumberSubscribeOfSupporter(_userId),
      totalNumberConfirmedOfSupporter(_userId),
      // totalNumberPendingOfSupporter(_userId),
      // totalNumberActiveOfSupporter(_userId),
      // totalNumberResolvedOfSupporter(_userId),
    ]);
    return {
      // totalRequestCount,
      requestConfirmedCount,
      // requestResolvedCount,
      // requestPendingCount,
      // requestActiveCount,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const getUserManageStats = async (ctx) => {
  const userId = ctx?.user?.id;
  const today = new Date(Date.now());

  try {
    const roleOfUser = await Admin.findOne({
      where: {
        id: userId,
      },
      attributes: ["role"],
      raw: true,
    });

    if (roleOfUser.role === "evtCollaborator") {
      const eventList = await Event.findAll({
        where: {
          createId: userId,
          endAt: {
            [Op.gt]: today,
          },
        },
        attributes: ["id"],
        raw: true,
      });

      const listUserInEvent = await Promise.all(
        map(eventList, async (event) => {
          const userInEvent = await UserEvent.findAll({
            where: {
              eventId: event.id,
            },
            attributes: ["eventId", "userId"],
            raw: true,
          });
          return userInEvent;
        })
      );

      const listUsersDetail = await Promise.all(
        map(listUserInEvent, async (user) => {})
      );
    } else if (roleOfUser.role === "admin") {
    }
  } catch (error) {
    return error;
  }
};

const getUser = async (id) => {
  return User.findOne({
    where: { id },
    raw: true,
  });
};

const getUserRank = async (id) => {
  return Ranking.findOne({
    where: { userId: id },
    raw: true,
  });
};

const getUserData = async (id) => {
  const [user, ranking] = await Promise.all([getUser(id), getUserRank(id)]);
  return {
    ...user,
    ...ranking,
  };
};

const searchSuggest = async (key) => {
  const today = new Date(Date.now());
  try {
    const eventSimilar = await Event.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${key}%`,
            },
          },
          {
            hashtag: {
              [Op.like]: `%${key}%`,
            },
          },
        ],
        endAt: {
          [Op.gt]: today,
        },
      },
      attributes: ["id", "title", "createdAt", "endAt", "hashtag"],
      raw: true,
      limit: 5,
    });

    const postSimilar = await Post.findAll({
      where: {
        title: {
          [Op.like]: `%${key}%`,
        },
        deadline: {
          [Op.gt]: today,
        },
      },
      attributes: [
        "id",
        "userId",
        "title",
        "minPrice",
        "hashtag",
        "createdAt",
        "deadline",
      ],
      raw: true,
      limit: 2,
    });

    return await eventSimilar.concat(postSimilar);
  } catch (error) {
    console.log(error);
  }
};

export default {
  getUserInfoById,
  fetchByEmail,
  getUserPostStats,
  getSupporterStats,
  getUserData,
  searchSuggest,
};
