import { BadRequestError, NotFoundError } from "../utils/errors";
import UserPost from "../models/user-post.model";
import { Op } from "sequelize";
import MySQLClient from "../clients/mysql";
import { map, filter, isEmpty, compact, isEqual } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import Ranking from "../models/ranking.model";
import userPermissionService from "./user-permission.service";
import NotificationService from "./notification.service";
import { NOTI_TYPE } from "../constants/notification";
import UsersService from "./users.service";
import ActivityService from "./activity.service";

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

  if (time === "semester") {
    timeFilter = "AND createdAt BETWEEN '2022-03-01' AND '2022-05-06'";
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
  const { user } = ctx;
  try {
    const userPost = await UserPost.findOne({
      where: {
        postId,
      },
      attributes: ["userId", "eventId", "registerId", "isConfirmed"],
      raw: true,
    });

    if (
      userPermissionService.checkUserRegisterPermission(
        user.id,
        userPost.eventId
      )
    ) {
      const mapRegister = !isEmpty(userPost.registerId)
        ? [...userPost.registerId, user.id]
        : [user.id];

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
        postId: postId,
        eventId: userPost.eventId,
        notificationType: NOTI_TYPE.RequestRegister,
        fromUserId: user.id,
        fromUsername: user.name,
      };

      const payloadActivity = {
        userId: user.id,
        username: user.name,
        action: NOTI_TYPE.RequestRegister,
        content: `Người dùng ${user.id} đăng kí hỗ trợ vấn đề ${postId}`,
      };

      await Promise.all([
        NotificationService.create(payload),
        ActivityService.create(payloadActivity),
      ]);

      return { status: 200 };
    } else {
      throw new BadRequestError({
        field: "id",
        message: "Người dùng đang bị giới hạn đăng kí hỗ trợ!",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const removeRegister = async (ctx, payload) => {
  const { user } = ctx;
  const { postId, registerId } = payload;

  try {
    const post = await UserPost.findOne({
      where: { postId, userId: user.id },
      raw: true,
    });

    const removeRegisterFromRegisterList = post.registerId.filter(
      (o) => o !== registerId
    );

    const listRegister =
      removeRegisterFromRegisterList.length === 0
        ? null
        : removeRegisterFromRegisterList;

    await UserPost.update(
      { registerId: listRegister },
      { where: { postId, userId: user.id } }
    );

    const payloadNoti = {
      userId: registerId,
      postId: postId,
      eventId: post.eventId,
      notificationType: NOTI_TYPE.RemoveRegister,
      fromUserId: user.id,
      fromUsername: user.name,
    };

    const payloadActivity = {
      userId: user.id,
      username: user.name,
      action: NOTI_TYPE.RemoveRegister,
      content: `Loại người đăng kí ${registerId} ra khỏi vấn đề ${postId}`,
    };

    await Promise.all([
      NotificationService.create(payloadNoti),
      ActivityService.create(payloadActivity),
    ]);

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const cancelRegister = async (ctx, payload) => {
  const { user } = ctx;
  const { postId } = payload;
  try {
    const post = await UserPost.findOne({
      where: { postId },
      raw: true,
    });
    const newRegisters = post.registerId.filter((o) => o !== user.id);

    await UserPost.update(
      { registerId: newRegisters?.length === 0 ? null : newRegisters },
      { where: { postId } }
    );

    const payload = {
      userId: post.userId,
      postId: postId,
      eventId: post.eventId,
      notificationType: NOTI_TYPE.CancelRegister,
      fromUserId: user.id,
      fromUsername: user.name,
    };

    const payloadActivity = {
      userId: user.id,
      username: user.name,
      action: NOTI_TYPE.CancelRegister,
      content: `Người dùng ${user.id} hủy đăng kí hỗ trợ cho vấn đề ${postId}`,
    };

    await Promise.all([
      NotificationService.create(payload),
      ActivityService.create(payloadActivity),
    ]);

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const unsupport = async (ctx, payload) => {
  const { user } = ctx;
  const { postId } = payload;
  try {
    const post = await UserPost.findOne({
      where: { postId },
      raw: true,
    });
    const newSupportList = post.supporterId.filter((o) => o !== user.id);

    await UserPost.update(
      { supporterId: newSupportList?.length === 0 ? null : newSupportList },
      { where: { postId } }
    );

    const payload = {
      userId: post.userId,
      postId: postId,
      eventId: post.eventId,
      notificationType: NOTI_TYPE.CancelSupport,
      fromUserId: user.id,
      fromUsername: user.name,
    };
    await NotificationService.create(payload);
    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: error,
    });
  }
};

const addSupporter = async (ctx, payload) => {
  const { user } = ctx;
  const { postId, registerId } = payload;
  try {
    const post = await UserPost.findOne({
      where: { postId, userId: user.id },
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
      const listRegisterIds =
        newRegisterIds.length === 0 ? null : newRegisterIds;
      await UserPost.update(
        {
          supporterId: newSupportIds,
          registerId: listRegisterIds,
          isConfirmed: 1,
          isPending: 0,
        },
        { where: { postId, userId: user.id } }
      );

      const payloadActivity = {
        userId: user.id,
        username: user.name,
        action: NOTI_TYPE.AcceptSupporter,
        content: `Chọn người hỗ trợ ${registerId} cho vấn đề ${postId}`,
      };

      const payloadNoti = {
        userId: registerId,
        postId,
        notificationType: NOTI_TYPE.AcceptSupporter,
        fromUserId: user.id,
        fromUsername: user.name,
      };

      await Promise.all([
        NotificationService.create(payloadNoti),
        ActivityService.create(payloadActivity),
      ]);

      return { status: 200 };
    } else {
      return { status: "fail" };
    }
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy người dùng.",
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
    timeFilter = "AND createdAt >= date_sub(now(), interval 1 week)";
  }

  if (time === "semester") {
    timeFilter = "AND createdAt BETWEEN '2022-03-01' AND '2022-05-06'";
  }

  if (time === "month") {
    timeFilter = "AND createdAt >= date_sub(now(), interval 1 month)";
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
          UsersService.getUserData(post.userId),
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
          UsersService.getUserData(post.userId),
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
    });
    const res = await Promise.all(
      map(postHasRegister, async (post) => {
        const postData = await getPost(post.postId);
        const registerUsers = await Promise.all(
          map(post.registerId, async (id) => {
            const registerUser = await UsersService.getUserData(id);
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
      message: "Không tìm thấy người dùng.",
    });
  }
};

const listPostHasNoRegister = async (userId, limit, offset) => {
  try {
    const postHasNoRegister = await UserPost.findAll({
      where: {
        userId,
        registerId: {
          [Op.eq]: null,
        },
        supporterId: {
          [Op.eq]: null,
        },
      },
      raw: true,
      limit,
      offset,
    });
    const res = await Promise.all(
      map(postHasNoRegister, async (post) => {
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
      message: "Không tìm thấy người dùng.",
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
            const userData = await UsersService.getUserData(id);
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
      message: "Không tìm thấy người dùng.",
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
      message: "Không tìm thấy người dùng.",
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
      message: "Không tìm thấy người dùng.",
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
      postHasRegister: postHasRegister,
      postHasNoRegister: postHasNoRegister,
      postHasSupporter: postHasSupporter,
      postOnEvent: postOnEvent,
      postDone: postDone,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "ctx",
      message: "Không tìm thấy người dùng.",
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
      field: "ctx",
      message: "Không tìm thấy người dùng.",
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

    const totalPosted = await UserPost.findAll({
      where: {
        userId,
      },
      logging: true,
      raw: true,
    });

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
      field: "ctx",
      message: "Không tìm thấy người dùng.",
    });
  }
};

const getListPostNoRegister = async () => {
  try {
    const listNoRegisterPost = await UserPost.findAll({
      where: {
        registerId: {
          [Op.eq]: null,
        },
        isDone: 0,
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listNoRegisterPost, async (noRegister) => {
        const postDetail = await Post.findOne({
          where: {
            id: noRegister.postId,
          },
          raw: true,
        });

        return { ...noRegister, ...postDetail };
      })
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "",
      message: "Có lỗi khi tìm vấn đề.",
    });
  }
};

const userRequestDone = async (ctx, postId) => {
  const { user } = ctx;
  try {
    const postDetail = await UserPost.findOne({
      where: {
        postId,
      },
      raw: true,
    });

    if (postDetail.requestDone === null) {
      if (user.id === postDetail.userId) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              userId: user.id,
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.RequestDone,
          content: `Yêu cầu đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        for (const supporter of postDetail.supporterId) {
          const payloadNoti = {
            userId: supporter,
            postId,
            notificationType: NOTI_TYPE.RequestDone,
            fromUserId: user.id,
            fromUsername: user.name,
          };

          await NotificationService.create(payloadNoti);
        }

        return payloadActivity;
      } else if (postDetail.supporterId.includes(user.id)) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.RequestDone,
          content: `Yêu cầu đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        const payloadNoti = {
          userId: postDetail.userId,
          postId,
          notificationType: NOTI_TYPE.RequestDone,
          fromUserId: user.id,
          fromUsername: user.name,
        };

        await NotificationService.create(payloadNoti);

        return payloadActivity;
      }
    } else {
      if (
        !postDetail.requestDone.includes(user.id) &&
        postDetail.userId === user.id
      ) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.ConfirmDone,
          content: `Xác nhận đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        for (const supporter of postDetail.requestDone) {
          const payloadNoti = {
            userId: supporter,
            postId,
            notificationType: NOTI_TYPE.ConfirmDone,
            fromUserId: user.id,
            fromUsername: user.name,
          };

          await NotificationService.create(payloadNoti);
        }

        return payloadActivity;
      } else if (
        postDetail.supporterId.includes(user.id) &&
        !postDetail.requestDone.includes(user.id)
      ) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.ConfirmDone,
          content: `Xác nhận đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        const payloadNoti = {
          userId: postDetail.userId,
          postId,
          notificationType: NOTI_TYPE.ConfirmDone,
          fromUserId: user.id,
          fromUsername: user.name,
        };

        await NotificationService.create(payloadNoti);

        return payloadActivity;
      }
    }
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Có lỗi khi tìm vấn đề.",
    });
  }
};

const userRequestDone1vs1 = async (ctx, postId) => {
  const { user } = ctx;
  try {
    const postDetail = await UserPost.findOne({
      where: {
        postId,
      },
      raw: true,
    });

    if (postDetail.requestDone === null) {
      if (user.id === postDetail.userId) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              userId: user.id,
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.RequestDone,
          content: `Yêu cầu đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        for (const supporter of postDetail.supporterId) {
          const payloadNoti = {
            userId: supporter,
            postId,
            notificationType: NOTI_TYPE.RequestDone,
            fromUserId: user.id,
            fromUsername: user.name,
          };

          await NotificationService.create(payloadNoti);
        }

        return payloadActivity;
      } else if (postDetail.supporterId.includes(user.id)) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.RequestDone,
          content: `Yêu cầu đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        const payloadNoti = {
          userId: postDetail.userId,
          postId,
          notificationType: NOTI_TYPE.RequestDone,
          fromUserId: user.id,
          fromUsername: user.name,
        };

        await NotificationService.create(payloadNoti);

        return payloadActivity;
      }
    } else {
      if (
        !postDetail.requestDone.includes(user.id) &&
        postDetail.userId === user.id
      ) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            isDone: 1,
            isConfirmed: 0,
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.ConfirmDone,
          content: `Xác nhận đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        for (const supporter of postDetail.requestDone) {
          const payloadNoti = {
            userId: supporter,
            postId,
            notificationType: NOTI_TYPE.ConfirmDone,
            fromUserId: user.id,
            fromUsername: user.name,
          };

          await NotificationService.create(payloadNoti);
        }

        return payloadActivity;
      } else if (
        postDetail.supporterId.includes(user.id) &&
        !postDetail.requestDone.includes(user.id)
      ) {
        const mapRequester = !isEmpty(postDetail.requestDone)
          ? [...postDetail.requestDone, user.id]
          : [user.id];

        const update = await UserPost.update(
          {
            isDone: 1,
            isConfirmed: 0,
            requestDone: mapRequester,
          },
          {
            where: {
              postId,
            },
          }
        );

        const payloadActivity = {
          userId: user.id,
          username: user.name,
          action: NOTI_TYPE.ConfirmDone,
          content: `Xác nhận đóng vấn đề ${postId}`,
        };

        await ActivityService.create(payloadActivity);

        const payloadNoti = {
          userId: postDetail.userId,
          postId,
          notificationType: NOTI_TYPE.ConfirmDone,
          fromUserId: user.id,
          fromUsername: user.name,
        };

        await NotificationService.create(payloadNoti);

        return payloadActivity;
      }
    }
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Có lỗi khi tìm vấn đề.",
    });
  }
};

/**
 * Job run every 30 minutes.
 * @returns status : 200.
 */
const closeDonePost = async () => {
  try {
    const listPost = await UserPost.findAll({
      where: {
        isDone: 0,
        isConfirmed: 1,
        requestDone: {
          [Op.ne]: null,
        },
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listPost, async (postDetail) => {
        const tempArray = [postDetail.userId, ...postDetail.supporterId];

        if (isEqual(postDetail.requestDone.sort(), tempArray.sort())) {
          const update = await UserPost.update(
            {
              isDone: 1,
              isConfirmed: 0,
            },
            {
              where: {
                postId: postDetail.postId,
              },
            }
          );

          const payloadActivity = {
            userId: 5,
            username: "System",
            action: NOTI_TYPE.SysClosePost,
            content: `Hệ thống xác nhận đóng vấn đề ${postDetail.postId}`,
          };

          await ActivityService.create(payloadActivity);

          for (const supporter of postDetail.requestDone) {
            const payloadNoti = {
              userId: supporter,
              postId: postDetail.postId,
              notificationType: NOTI_TYPE.SysClosePost,
              fromUserId: 5,
              fromUsername: "Hệ thống",
            };

            await NotificationService.create(payloadNoti);
          }
        }
      })
    );

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "",
      message: error,
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
  unsupport,
  addRegister,
  userRequestDone,
  getRegisteredNearDeadline,
  postDoneOfUser,
  getListPostNoRegister,
  closeDonePost,
  userRequestDone1vs1,
};
