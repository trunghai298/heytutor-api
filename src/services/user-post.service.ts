import { BadRequestError, NotFoundError } from "../utils/errors";
import UserPost from "../models/user-post.model";
import { Op } from "sequelize";
import MySQLClient from "../clients/mysql";
import { map, countBy, flattenDeep } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import Ranking from "../models/ranking.model";

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
      logging: true,
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
  } catch (error) {
    console.log(error);
  }
};

const updatePostStatus = async (post) => {
  const { postId, status } = post;

  try {
    if (status === "isActive") {
      await UserPost.update(
        {
          isDone: 0,
          isActive: 1,
          isPending: 0,
        },
        { where: { postId }, logging: true }
      );
    } else if (status === "isDone") {
      await UserPost.update(
        {
          isDone: 1,
          isActive: 0,
          isPending: 0,
        },
        { where: { postId }, logging: true }
      );
    } else if (status === "isPending") {
      {
        await UserPost.update(
          {
            isDone: 0,
            isActive: 0,
            isPending: 1,
          },
          { where: { postId }, logging: true }
        );
      }
    }
    return { status: "done" };
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "postId",
      message: "Post is not found",
    });
  }
};

const listRegistedRequests = async (ctx, limit, offset) => {
  const userId = ctx?.user?.id || 2;
  const limitValue = limit || 100;
  const offsetValue = offset || 0;

  try {
    const res = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${userId}' , '$')`,
      { type: "SELECT" }
    );

    const attachPostData = await Promise.all(
      map(res, async (post) => {
        const postData = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });
        const userData = await User.findOne({
          where: { id: post.userId },
          raw: true,
          attributes: {
            exclude: ["password", "isAdmin"],
          },
        });
        const userRank = await Ranking.findOne({
          where: { userId: post.userId },
          raw: true,
        });

        return {
          ...post,
          postData,
          userData,
          rankPoint: userRank?.rankPoint || 0,
          voteCount: userRank?.voteCount || 0,
        };
      })
    );

    const allHashtag = map(attachPostData, (item) =>
      JSON.parse(item.postData.hashtag)
    );
    const hashTagGroup = countBy(flattenDeep(allHashtag));

    return {
      attachPostData,
      hashTagGroup,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: error,
    });
  }
};

const listPostHasRegister = async (userId, limit, offset) => {
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        registerId: {
          [Op.ne]: null,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });
        const registerUsers = await Promise.all(
          map(post.registerId, async (id) => {
            const registerUser = await User.findOne({
              where: { id },
              raw: true,
            });
            return {
              id: registerUser.id,
              username: registerUser.name,
              email: registerUser.email,
            };
          })
        );
        return { ...post, postData, registerUsers };
      })
    );

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const listPostHasNoRegister = async (userId, limit, offset) => {
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        registerId: {
          [Op.eq]: null,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });
        return { ...post, postData };
      })
    );

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const listPostHasSupporter = async (userId, limit, offset) => {
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        supporterId: {
          [Op.ne]: null,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });
        const supporterUsers = await Promise.all(
          map(post.registerId, async (id) => {
            const supporterUser = await User.findOne({
              where: { id },
              raw: true,
            });
            return {
              id: supporterUser.id,
              username: supporterUser.name,
              email: supporterUser.email,
            };
          })
        );
        return { ...post, postData, supporterUsers };
      })
    );

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const listPostOnEvent = async (userId, limit, offset) => {
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        eventId: {
          [Op.ne]: null,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });
        return { ...post, postData };
      })
    );

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const getListMyRequests = async (ctx, limit, offset) => {
  const userId = ctx?.user?.id || 2;
  const limitValue = limit || 100;
  const offsetValue = offset || 0;

  try {
    const postHasRegister = await listPostHasRegister(
      userId,
      limitValue,
      offsetValue
    );
    const postHasNoRegister = await listPostHasNoRegister(
      userId,
      limitValue,
      offsetValue
    );
    const postHasSupporter = await listPostHasSupporter(
      userId,
      limitValue,
      offsetValue
    );
    const postOnEvent = await listPostOnEvent(userId, limitValue, offsetValue);

    return {
      postHasRegister,
      postHasNoRegister,
      postHasSupporter,
      postOnEvent,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

// const getStatusOfPost = async (postId) => {
//   try {
//     const statusOfPost = await UserPost.findOne({
//       where: {
//         postId,
//       },
//     });
//     return statusOfPost;
//   } catch (error) {
//     throw new NotFoundError({
//       field: "eventId",
//       message: "Event is not found",
//     });
//   }
// };

export default {
  list,
  getPostStats,
  updatePostStatus,
  getListMyRequests,
  listRegistedRequests,
};
