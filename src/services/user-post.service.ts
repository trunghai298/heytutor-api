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

const getNbOfAllPost = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: userId,
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

const getNbOfAllPostRegistered = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
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
      attributes: ["registerId"],
      group: ["registerId"],
      logging: true,
    });

    let tempArray = [];
    for (const array of res) {
      if (array.registerId !== null && array.registerId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.registerId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.registerId);
        }
      }
    }

    let count = 0;
    for (let i = 0; i <= tempArray.length; i++) {
      if (tempArray[i] === userId) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.log(error);
  }
};

const getNbOfPendingPost = async (userId) => {
  // const today = new Date(Date.now());

  try {
    const res = await UserPost.findAll({
      where: {
        userId,
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
        // deadline: {
        //   [Op.gt]: today,
        // }
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
      logging: true,
    });
    return res.length;
  } catch (error) {}
};

const getNbOfConfirmedPost = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
        userId,
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
      logging: true,
    });
    return res.length;
  } catch (error) {}
};

const getNbOfConfirmedPostRegistered = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
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
      attributes: ["supporterId"],
      group: ["supporterId"],
      logging: true,
    });

    let tempArray = [];
    for (const array of res) {
      if (array.supporterId !== null && array.supporterId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.supporterId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.supporterId);
        }
      }
    }

    let count = 0;
    for (let i = 0; i <= tempArray.length; i++) {
      if (tempArray[i] === userId) {
        count++;
      }
    }

    return count;
  } catch (error) {}
};

const getNbOfActivePost = async (userId) => {
  // const today = new Date(Date.now());

  try {
    const res = await UserPost.findAll({
      where: {
        userId,
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
        // deadline: {
        //   [Op.gt]: today,
        // },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
    });
    return res.length;
  } catch (error) {}
};

const getNbOfDonePost = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
        userId,
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
      logging: true,
    });
    return res.length;
  } catch (error) {}
};

const getNbOfPostDone = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
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
      attributes: ["supporterId"],
      group: ["supporterId"],
      logging: true,
    });

    let tempArray = [];
    for (const array of res) {
      if (array.supporterId !== null && array.supporterId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.supporterId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.supporterId);
        }
      }
    }

    let count = 0;
    for (let i = 0; i <= tempArray.length; i++) {
      if (tempArray[i] === userId) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.log(error);
  }
};

const getNbOfOnEvent = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
        userId,
        eventId: {
          [Op.ne]: null,
        },
      },
      raw: true,
      attributes: ["userId", "postId"],
      group: ["userId", "postId"],
      logging: true,
    });
    return res.length;
  } catch (error) {}
};

const getNbOfOnEventRegistered = async (userId) => {
  try {
    const res = await UserPost.findAll({
      where: {
        eventId: {
          [Op.ne]: null,
        },
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
      attributes: ["registerId"],
      group: ["registerId"],
      logging: true,
    });

    let tempArray = [];
    for (const array of res) {
      if (array.registerId !== null && array.registerId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.registerId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.registerId);
        }
      }
    }

    let count = 0;
    for (let i = 0; i <= tempArray.length; i++) {
      if (tempArray[i] === userId) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.log(error);
  }
};

const getPostStats = async (ctx) => {
  // const { user } = ctx;
  const userId = ctx?.user?.id || 2;

  try {
    const nbOfAllPost = await getNbOfAllPost(userId);

    const nbOfPendingPost = await getNbOfPendingPost(userId);

    const nbOfConfirmedPost = await getNbOfConfirmedPost(userId);
    const nbOfConfirmedPostRegistered = await getNbOfConfirmedPostRegistered(
      userId
    );

    const nbOfActivePost = await getNbOfActivePost(userId);
    const nbOfActivePostRegistered = await getNbOfAllPostRegistered(userId);

    const nbOfDonePost = await getNbOfDonePost(userId);
    const nbOfDonePostRegistered = await getNbOfPostDone(userId);

    return {
      myRequestStats: {
        nbOfPendingPost,
        nbOfConfirmedPost,
        nbOfActivePost,
      },
      myRegisterStats: {
        nbOfActivePost: nbOfActivePostRegistered,
        nbOfConfirmedPost: nbOfConfirmedPostRegistered,
        nbOfDonePost: nbOfDonePostRegistered,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

const updatePostStatus = async (payload) => {
  const { postId, status, userId } = payload;

  try {
    const listRegister = await UserPost.findOne({
      where: { postId },
    });

    let mapRegister = listRegister.registerId;

    const listSupporter = await UserPost.findOne({
      where: { postId },
      attributes: ["supporterId"],
    });
    let mapSupporter = listSupporter.supporterId;

    if (status === "isActive") {
      if (mapRegister === null) {
        mapRegister = [userId];
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
        mapRegister.push(userId);
        await UserPost.update(
          {
            registerId: mapRegister,
          },
          { where: { postId } }
        );
      }
    } else if (status == "isConfirmed") {
      if (mapSupporter === null) {
        mapSupporter = [userId];
        await UserPost.update(
          {
            isDone: 0,
            isActive: 0,
            isPending: 0,
            isConfirmed: 1,
            supporterId: mapSupporter,
          },
          { where: { postId } }
        );
      } else {
        mapSupporter.push(userId);
        await UserPost.update(
          {
            supporterId: mapSupporter,
          },
          { where: { postId } }
        );
      }
    } else if (status === "isDone") {
      await UserPost.update(
        {
          isDone: 1,
          isActive: 0,
          isPending: 0,
          isConfirmed: 0,
        },
        { where: { postId } }
      );
    } else if (status === "isPending") {
      await UserPost.update(
        {
          isDone: 0,
          isActive: 0,
          isPending: 1,
          isConfirmed: 0,
        },
        { where: { postId } }
      );
    }

    return { postId, status, userId };
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "postId",
      message: "Post is not found",
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
        const [postData, userData] = await Promise.all([
          getPost(post.postId),
          getUserData(post.userId),
        ]);

        return {
          ...post,
          postData,
          userData,
        };
      })
    );

    const allHashtag = map(attachPostData, (item) =>
      JSON.parse(item.postData.hashtag)
    );
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

export default {
  list,
  getPostStats,
  updatePostStatus,
  getListMyRequests,
  listRegistedRequests,
};
