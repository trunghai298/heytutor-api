import { BadRequestError, NotFoundError } from "../utils/errors";
import UserPost from "../models/user-post.model";
import { Op } from "sequelize";
import MySQLClient from "../clients/mysql";
import { map, countBy, flattenDeep, filter, isEmpty } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import Ranking from "../models/ranking.model";
import userPermissionService from "./user-permission.service";
import Notification from "../models/notification.model";

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

const getNbOfAllPost = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: { userId },
      raw: true,
    });

    return res;
  } catch (error) {
    console.log(error);
  }
};

const getPostStats = async (ctx) => {
  // const { user } = ctx;
  const userId = ctx?.user?.id || 2;

  try {
    // my request
    const myRequests = await getNbOfAllPost(userId);
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
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${userId}' , '$')`,
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

// const updatePostStatus = async (payload) => {
//   const { postId, status, userId } = payload;

//   try {
//     const listRegister = await UserPost.findOne({
//       where: { postId },
//       attributes: ["registerId"],
//       raw: true,
//     });

//     let mapRegister = listRegister.registerId;

//     const listSupporter = await UserPost.findOne({
//       where: { postId },
//       attributes: ["supporterId"],
//       raw: true,
//     });
//     let mapSupporter = listSupporter.supporterId;

//     if (status === "isActive") {

//     } else if (status == "isConfirmed") {
//       if (mapSupporter === null) {
//         mapSupporter = [userId];
//         await UserPost.update(
//           {
//             isDone: 0,
//             isActive: 0,
//             isPending: 0,
//             isConfirmed: 1,
//             supporterId: mapSupporter,
//           },
//           { where: { postId } }
//         );
//       } else {
//         mapSupporter.push(userId);
//         await UserPost.update(
//           {
//             supporterId: mapSupporter,
//           },
//           { where: { postId } }
//         );
//       }
//     } else if (status === "isDone") {
//       await UserPost.update(
//         {
//           isDone: 1,
//           isActive: 0,
//           isPending: 0,
//           isConfirmed: 0,
//         },
//         { where: { postId } }
//       );
//     } else if (status === "isPending") {
//       await UserPost.update(
//         {
//           isDone: 0,
//           isActive: 0,
//           isPending: 1,
//           isConfirmed: 0,
//         },
//         { where: { postId } }
//       );
//     }

//     return { postId, status, userId };
//   } catch (error) {
//     console.log(error);
//     throw new NotFoundError({
//       field: "postId",
//       message: "Post is not found",
//     });
//   }
// };

const addRegister = async (ctx, postId) => {
  const userId = ctx?.user?.id || 2;
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
      const payload = {
        userId: userPost.userId,
        postId: userPost.postId,
        eventId: userPost.eventId,
        notificationType: "request_register",
      };
      await Notification.newNotification(payload);
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
  const userId = ctx?.user?.id || 2;
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

    return { status: "success" };
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: error,
    });
  }
};

const addSupporter = async (ctx, payload) => {
  const userId = ctx?.user?.id || 2;
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
      return { status: 200 };
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

const unregister = async (ctx, payload) => {
  const userId = ctx?.user?.id || 2;
  const { postId } = payload;

  try {
    const post = await UserPost.findOne({
      where: { postId },
      raw: true,
    });

    const currentRegisterIds = post.registerId;
    const newRegisterIds = currentRegisterIds.filter((o) => o !== userId);
    await UserPost.update(
      { registerId: newRegisterIds },
      { where: { postId } }
    );
    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: error,
    });
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

const getPost = async (id) => {
  return Post.findOne({
    where: { id },
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

const listRegistedRequests = async (ctx, params) => {
  const userId = ctx?.user?.id || 2;
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
    const res = await MySQLClient.query(
      `SELECT * FROM UserPosts WHERE JSON_CONTAINS(JSON_EXTRACT(UserPosts.registerId, '$[*]'), '${userId}' , '$') ${timeFilter}`,
      { type: "SELECT" }
    );

    const attachPostData = await Promise.all(
      map(res, async (post) => {
        const [postData, userData] = await Promise.all([
          getPost(post.postId),
          getUserData(post.userId),
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

    const allHashtag = map(attachPostData, (item) => JSON.parse(item.hashtag));
    const hashTagGroup = countBy(flattenDeep(allHashtag || []));

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
            const registerUser = await getUserData(id);
            return {
              id: registerUser.id,
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
            const userData = await getUserData(id);
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

export default {
  list,
  getPostStats,
  getListMyRequests,
  listRegistedRequests,
  removeRegister,
  addSupporter,
  unregister,
  addRegister,
};
