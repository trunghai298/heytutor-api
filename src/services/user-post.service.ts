import { create } from "./comment.service";
import { BadRequestError, NotFoundError } from "../utils/errors";
import UserPost from "../models/user-post.model";
import { Op } from "sequelize";
import MySQLClient from "../clients/mysql";
import { map, countBy, flattenDeep, filter, isEmpty, compact } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import Ranking from "../models/ranking.model";
import userPermissionService from "./user-permission.service";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import usersService from "./users.service";

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

// const create = async (payload) => {
//   const {eventId, title, hashtag, limit, content, images} = payload;
//   try {
//     if (isEmpty(payload.content)) {
//       throw new BadRequestError({
//         field: "content",
//         message: "Failed to create this post.",
//       });
//     }
//     const post = await Post.create({
//       title:
//     });
//     return post;
//   } catch (error) {
//     throw new BadRequestError({
//       field: "postId",
//       message: "Failed to create this post.",
//     });
//   }
// };

const getNbOfAllPost = async (userId, timeFilter) => {
  try {
    const res = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE userId=${userId} ${timeFilter}`,
      {
        type: "SELECT",
      }
    );

    return res;
  } catch (error) {
    console.log(error);
  }
};

const getPostStats = async (ctx, filters) => {
  const { user } = ctx;

  const filterParams = JSON.parse(filters);
  const { time } = filterParams;
  let timeFilter;

  if (time === "week") {
    timeFilter = "AND createdAt > date_sub(now(), interval 1 week)";
  }

  if (time === "month") {
    timeFilter = "AND createdAt > date_sub(now(), interval 1 month)";
  }

  if (time.includes("BETWEEN")) {
    timeFilter = `AND createdAt ${filterParams.time}`;
  }

  try {
    // my request
    const myRequests = await getNbOfAllPost(user.id, timeFilter);

    const nbOfConfirmedPost = filter(
      myRequests,
      (item) => item.isConfirmed === 1 && item.isDone !== 1
    ).length;
    const nbOfDonePost = filter(myRequests, (item) => item.isDone === 1).length;
    const nbOfPostOnEvent = filter(
      myRequests,
      (item) => item.eventId !== null
    ).length;
    const nbOfPostHasRegister = filter(
      myRequests,
      (item) => item.supporterId === null && item.registerId !== null
    ).length;
    const nbOfPostHasNoRegister = filter(
      myRequests,
      (item) => item.supporterId === null && item.registerId === null
    ).length;
    //

    // request di dang ki lam support
    const registeredRequest = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${user.id}' , '$')`,
      { type: "SELECT" }
    );

    const totalRegisterPost = registeredRequest.length;
    const nbOfActivePostRegistered = filter(
      registeredRequest,
      (item) => item.isActive === 1
    ).length;

    const nbOfDonePostRegistered = filter(
      registeredRequest,
      (item) => item.isDone === 1
    ).length;

    const nbOfConfirmedPostRegistered = filter(
      registeredRequest,
      (item) => item.isConfirmed === 1
    ).length;

    const nbOfPendingPostRegistered = filter(
      registeredRequest,
      (item) => item.isPending === 1
    ).length;

    return {
      myRequestStats: {
        nbOfAllPost: myRequests.length,
        nbOfConfirmedPost,
        nbOfDonePost,
        nbOfPostOnEvent,
        nbOfPostHasRegister,
        nbOfPostHasNoRegister,
      },
      myRegisterStats: {
        nbOfTotalRegisteredPost: totalRegisterPost,
        nbOfActivePost: nbOfActivePostRegistered,
        nbOfConfirmedPost: nbOfConfirmedPostRegistered,
        nbOfDonePostRegistered: nbOfDonePostRegistered,
        nbOfDonePost: nbOfDonePostRegistered,
        nbOfPendingPost: nbOfPendingPostRegistered,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

const addRegister = async (ctx, postId) => {
  const userId = ctx?.user?.id;
  try {
    const userPost = UserPost.findOne({
      where: {
        postId,
      },
      attributes: ["userId", "eventId", "registerId", "isConfirmed"],
      raw: true,
    });
    if (
      userPermissionService.checkUserRegisterPermission(
        userId,
        userPost.eventId
      )
    ) {
      const mapRegister = !isEmpty(userPost.registerId)
        ? [...userPost.registerId, userId]
        : [userId];

      if (userPost.isConfirmed === 0) {
        await UserPost.update(
          {
            isDone: 0,
            isActive: 1,
            isPending: 0,
            isConfirmed: 0,
            registerId: mapRegister,
          },
          { where: { postId } }
        );
      } else {
        await UserPost.update(
          {
            registerId: mapRegister,
          },
          { where: { postId } }
        );
      }
      const user = await User.findOne({
        where: { userId },
        attributes: ["name"],
        raw: true,
      });
      const payload = {
        userId: userPost.userId,
        postId: userPost.postId,
        eventId: userPost.eventId,
        notificationType: NOTI_TYPE.RequestRegister,
        fromUserId: userId,
        fromUsername: user.name,
      };
      await NotificationService.create(payload);
      return "Register Success!!!";
    } else {
      throw new BadRequestError({
        field: "id",
        message: "Bạn đang bị cấm đăng kí bài!!!",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: error,
    });
  }
};

const removeRegister = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { postId, registerId } = payload;

  try {
    const post = await UserPost.findOne({
      where: { postId, userId },
      raw: true,
    });

    const removeRegisterFromRegisterList = post.registerId.filter(
      (o) => o !== registerId
    );

    await UserPost.update(
      { registerId: removeRegisterFromRegisterList },
      { where: { postId, userId } }
    );

    const user = await User.findOne({
      where: { userId },
      attributes: ["name"],
      raw: true,
    });
    const payload = {
      userId: registerId,
      postId: postId,
      eventId: post.eventId,
      notificationType: NOTI_TYPE.RemoveRegister,
      fromUserId: userId,
      fromUsername: user.name,
    };
    await NotificationService.create(payload);
    return "Remove Register Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: error,
    });
  }
};

const cancelRegister = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { postId, ownerId } = payload;
  try {
    const post = await UserPost.findOne({
      where: { postId, ownerId },
      raw: true,
    });

    const removeRegisterFromRegisterList = post.registerId.filter(
      (o) => o !== userId
    );

    await UserPost.update(
      { registerId: removeRegisterFromRegisterList },
      { where: { postId, ownerId } }
    );

    const user = await User.findOne({
      where: { userId },
      attributes: ["name"],
      raw: true,
    });
    const payload = {
      userId: ownerId,
      postId: postId,
      eventId: post.eventId,
      notificationType: NOTI_TYPE.CancelRegister,
      fromUserId: userId,
      fromUsername: user.name,
    };
    await NotificationService.create(payload);
    return "Cancel Register Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: error,
    });
  }
};

const addSupporter = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { postId, registerId } = payload;
  try {
    const post = await UserPost.findOne({
      where: { postId, userId },
      attributes: ["registerId", "supporterId"],
      raw: true,
    });

    if (
      post.registerId?.includes(registerId) &&
      !post.supporterId?.includes(registerId)
    ) {
      const newSupportIds = !isEmpty(post.supporterId)
        ? [...post.supporterId, registerId]
        : [registerId];

      const newRegisterIds = post.registerId.filter((o) => o !== registerId);

      await UserPost.update(
        {
          supporterId: newSupportIds,
          registerId: newRegisterIds,
          isConfirmed: 1,
          isPending: 0,
        },
        { where: { postId, userId } }
      );
      const user = await User.findOne({
        where: { userId },
        attributes: ["name"],
        raw: true,
      });
      await NotificationService.create({
        userId: registerId,
        postId,
        notificationType: NOTI_TYPE.AcceptSupporter,
        fromUserId: userId,
        fromUsername: user.name,
      });
      return "Accept Supporter Success!!!";
    } else {
      return { status: "fail" };
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: error,
    });
  }
};

// const unregister = async (ctx, payload) => {
//   const userId = ctx?.user?.id;
//   const { postId } = payload;

//   try {
//     const post = await UserPost.findOne({
//       where: { postId },
//       raw: true,
//     });

//     const currentRegisterIds = post.registerId;
//     const newRegisterIds = currentRegisterIds.filter((o) => o !== userId);
//     await UserPost.update(
//       { registerId: newRegisterIds },
//       { where: { postId } }
//     );
//     return { status: 200 };
//   } catch (error) {
//     throw new BadRequestError({
//       field: "postId",
//       message: error,
//     });
//   }
// };

const getPost = async (id) => {
  return Post.findOne({
    where: { id },
    raw: true,
  });
};

const listRegistedRequests = async (ctx, params) => {
  const userId = ctx?.user?.id;
  const { limit, offset, filters } = params;
  const filterParams = JSON.parse(filters);

  const { time } = filterParams;
  let timeFilter;

  if (time === "week") {
    timeFilter = "AND createdAt > date_sub(now(), interval 1 week)";
  }

  if (time === "month") {
    timeFilter = "AND createdAt > date_sub(now(), interval 1 month)";
  }

  if (time.includes("BETWEEN")) {
    timeFilter = `AND createdAt ${filterParams.time}`;
  }

  try {
    const registering = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${userId}' , '$') ${timeFilter}`,
      { type: "SELECT" }
    );

    const supporting = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.supporterId, '$[*]'), '${userId}' , '$') ${timeFilter}`,
      { type: "SELECT" }
    );

    const registerData = await Promise.all(
      map(registering, async (post) => {
        const [postData, userData] = await Promise.all([
          getPost(post.postId),
          usersService.getUserData(post.userId),
        ]);

        delete postData.id;
        delete postData.createdAt;
        delete postData.updatedAt;
        delete userData.id;

        return {
          ...post,
          ...postData,
          ...userData,
        };
      })
    );

    const supportData = await Promise.all(
      map(supporting, async (post) => {
        const [postData, userData] = await Promise.all([
          getPost(post.postId),
          usersService.getUserData(post.userId),
        ]);

        delete postData.id;
        delete postData.createdAt;
        delete postData.updatedAt;
        delete userData.id;

        return {
          ...post,
          ...postData,
          ...userData,
        };
      })
    );

    return {
      registerData,
      supportData,
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
        supporterId: {
          [Op.eq]: null,
        },
        isDone: {
          [Op.ne]: 1,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await getPost(post.postId);
        const registerUsers = await Promise.all(
          map(post.registerId, async (id) => {
            const registerUser = await usersService.getUserData(id);
            return {
              id,
              username: registerUser.name,
              email: registerUser.email,
              rankPoint: registerUser.rankPoint || 0,
              voteCount: registerUser.voteCount || 0,
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
        const postData = await getPost(post.postId);
        if (postData) {
          return { ...post, postData };
        }
      })
    );

    return compact(res);
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
        isDone: {
          [Op.ne]: 1,
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
          map(post.supporterId, async (id) => {
            const userData = await usersService.getUserData(id);
            return {
              id: userData.id,
              username: userData.name,
              email: userData.email,
              rankPoint: userData?.rankPoint || 0,
              voteCount: userData?.voteCount || 0,
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
        isDone: {
          [Op.ne]: 1,
        },
      },
      raw: true,
      limit,
      offset,
    });

    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await getPost(post.postId);
        if (postData) {
          return { ...post, postData };
        }
      })
    );

    return compact(res);
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const listPostDone = async (userId, limit, offset) => {
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        isDone: {
          [Op.eq]: 1,
        },
      },
      raw: true,
      limit,
      offset,
    });

    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await getPost(post.postId);
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
  const userId = ctx?.user?.id;
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
    const postDone = await listPostDone(userId, limitValue, offsetValue);

    return {
      postHasRegister,
      postHasNoRegister,
      postHasSupporter,
      postOnEvent,
      postDone,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const getRegisteredNearDeadline = async (ctx) => {
  const userId = ctx?.user?.id;
  const today = new Date(Date.now());
  const twoDayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  try {
    const registeredRequest = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${userId}' , '$')`,
      { type: "SELECT" }
    );

    const activePostRegistered = filter(
      registeredRequest,
      (item) => item.isActive === 1
    );

    const res = await Promise.all(
      map(activePostRegistered, async (userPost) => {
        const postData = Post.findOne({
          where: {
            id: userPost.postId,
            deadline: {
              [Op.lt]: twoDayAfter,
              [Op.gt]: today,
            },
          },
          attributes: ["id", "userId", "title", "deadline"],
          raw: true,
        });
        return postData;
      })
    );

    return compact(res);
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

const postDoneOfUser = async (ctx) => {
  const userId = ctx?.user?.id;
  try {
    const postHasRegister = await UserPost.findAll({
      where: {
        userId,
        isDone: {
          [Op.eq]: 1,
        },
      },
      logging: true,
      raw: true,
    });

    console.log("postHasRegister", postHasRegister.length);

    const totalPosted = await UserPost.findAll({
      where: {
        userId,
      },
      logging: true,
      raw: true,
    });

    console.log("totalPosted", totalPosted.length);

    const supporterRequest = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.supporterId, '$[*]'), '${userId}' , '$')`,
      { type: "SELECT" }
    );

    const nbOfDonePostRegistered = filter(
      supporterRequest,
      (item) => item.isDone === 1
    );

    return {
      nbOfPostedDone: postHasRegister.length,
      nbOfPosted: totalPosted.length,
      nbOfPostSupportedDone: nbOfDonePostRegistered.length,
      nbOfPostSupported: supporterRequest.length,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "User not found.",
    });
  }
};

export default {
  list,
  getPostStats,
  getListMyRequests,
  listRegistedRequests,
  removeRegister,
  addSupporter,
  cancelRegister,
  addRegister,
  getRegisteredNearDeadline,
  postDoneOfUser,
};
