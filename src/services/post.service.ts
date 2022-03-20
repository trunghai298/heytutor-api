import { double } from "aws-sdk/clients/lightsail";
import Comment from "../models/comment.model";
import MySQLClient from "../clients/mysql";
import Post from "../models/post.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { isEmpty, omit, pick, compact } from "lodash";
import { map, find, intersection } from "lodash";
import User from "../models/user.model";
import { Op } from "sequelize";
import Student from "../models/student.model";
import UserPost from "../models/user-post.model";
import Ranking from "../models/ranking.model";

/**
 * To create a new post
 */
const create = async (payload) => {
  try {
    if (isEmpty(payload.content)) {
      throw new BadRequestError({
        field: "content",
        message: "Failed to create this post.",
      });
    }
    const post = await Post.create(payload);
    return post;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to create this post.",
    });
  }
};

const update = async (payload) => {
  const { postId } = payload;
  const transaction = await MySQLClient.transaction();
  try {
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError({
        field: "id",
        message: "Post is not found",
      });
    }

    await Post.update({ ...payload }, { where: { id: postId }, transaction });
    await transaction.commit();
    const postUpdated = await Post.findOne({ where: { id: postId } });
    return postUpdated;
  } catch (error) {
    await transaction.rollback();
    throw new BadRequestError({
      field: "postId",
      message: "Failed to update this post.",
    });
  }
};

/**
 * To edit an existed post
 */
const edit = async (payload) => {
  const transaction = await MySQLClient.transaction();
  try {
    const { postId, content } = payload;
    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundError({
        field: "id",
        message: "Post is not found",
      });
    }

    const updatedPost = await Post.update(
      { content },
      { where: { id: postId }, transaction }
    );
    await transaction.commit();
    return updatedPost;
  } catch (error) {
    await transaction.rollback();
    throw new BadRequestError({
      field: "postId",
      message: "Failed to edit this post.",
    });
  }
};

/**
 * To delete an existed post
 */
const deletePost = async (postId: string) => {
  const transaction = await MySQLClient.transaction();
  try {
    await Post.destroy({ where: { id: postId }, transaction });
    await transaction.commit();
  } catch (error) {
    if (transaction) transaction.rollback();
    throw new BadRequestError({
      field: "postId",
      message: "Failed to delete this post.",
    });
  }
};

const listAllPost = async (limit, offset) => {
  try {
    const listPost = await Post.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      raw: true,
      where: { isResolved: false },
    });

    const attachedUser = await Promise.all(
      map(listPost.rows, async (post) => {
        const user = await User.findOne({
          where: { id: post.userId },
          raw: true,
          attributes: {
            exclude: ["password"],
          },
        });

        const studentData = await Student.findOne({
          where: { stdId: user.stdId },
          raw: true,
        });

        return { ...post, user: { ...user, ...studentData } };
      })
    );

    return attachedUser;
  } catch (error) {
    console.log(error);
  }
};

const listPostByUserId = async (ctx, limit, offset) => {
  try {
    const userId = ctx?.user?.id || 2;

    const listPost = await Post.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      where: { userId },
      raw: true,
    });

    return listPost;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
    });
  }
};

/**
 * Count people comment in one post
 */
const countPeopleCmtOfPost = async (postId) => {
  try {
    const listUsers = await Comment.findAll({
      where: {
        postId,
      },
      include: [User],
      raw: true,
    });
    const res = map(listUsers, (user) => {
      const pickFields = pick(user, [
        "userId",
        "User.name",
        "User.email",
        "rollComment",
        "comment",
      ]);
      return pickFields;
    });
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post has no comment.",
    });
  }
};

const countPeopleRegisterOfPost = async (postId) => {
  try {
    const listUsers = await UserPost.findAll({
      where: {
        postId,
        supporterId: {
          [Op.eq]: null,
        },
        registerId: {
          [Op.ne]: null,
        },
      },
      raw: true,
    });

    const matchUserData = await Promise.all(
      map(listUsers, async (user) => {
        const userData = await User.findOne({
          where: { id: user.registerId },
          raw: true,
        });
        return userData;
      })
    );
    return matchUserData;
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post has no register.",
    });
  }
};

const countPeopleSupporterOfPost = async (postId) => {
  try {
    const supporters = await UserPost.findAll({
      where: {
        postId,
        supporterId: {
          [Op.ne]: null,
        },
      },
      raw: true,
    });

    const matchUserSupporter = await Promise.all(
      map(supporters, async (user) => {
        const userData = await User.findOne({
          where: { id: user.supporterId },
          raw: true,
        });
        return matchUserSupporter;
      })
    );

    const matchUserRank = await Promise.all(
      map(supporters, async (user) => {
        const userData = await Ranking.findOne({
          where: { userId: user.supporterId },
          raw: true,
        });
        return matchUserRank;
      })
    );

    let mapResult = new Map();

    for (const supporter of matchUserSupporter) {
      for (const rankInfo of matchUserRank) {
        if (supporter.userId === rankInfo.userId) {
          map.set(supporter, rankInfo.rankPoint);
        }
      }
    }

    return mapResult;
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "postId",
      message: "Post has no supporter.",
    });
  }
};

const postDetailByPostId = async (postId) => {
  try {
    const postDetail = await UserPost.findOne({
      where: { postId },
      include: [Post],
      raw: true,
      attributes: { exclude: ["Post.id", "Post.userId", "userId"] },
    });
    const res = omit(postDetail, [
      "id",
      "postId",
      "email",
      "supporterId",
      "registerId",
    ]);
    return res;
  } catch (error) {
    console.log(error);
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
    });
  }
};

const createFilters = (userId, filters) => {
  const where = {};
  where["userId"] = userId;
  map(filters, (filter) => {
    if (
      ["isPending", "isActive", "isDone", "isConfirmed"].includes(filter.type)
    ) {
      where[filter.type] = filter.value;
    }
    if (filter.type === "onEvent") {
      where["eventId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "supporterId") {
      where["supporterId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "registerId") {
      where["registerId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
  });
  console.log(where);
  return where;
};

const getListPostByFilter = async (filters, ctx) => {
  const filterObj = JSON.parse(filters)?.filters;
  const userId = ctx?.user?.id || 2;

  try {
    const listPost = await UserPost.findAndCountAll({
      where: createFilters(userId, filterObj),
      include: [Post],
      limit: 100,
      offset: 0,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const attachedUser = await Promise.all(
      map(listPost.rows, async (post) => {
        const registerUsers = await Promise.all(
          map(post.registerId, async (id) => {
            const user = await User.findOne({
              where: { id },
              raw: true,
              attributes: ["email", "name", "id", "stdId"],
            });
            return user;
          })
        );

        const supporterUsers = await Promise.all(
          map(post.supporterId, async (id) => {
            const user = await User.findOne({
              where: { id },
              raw: true,
              attributes: ["email", "name", "id", "stdId"],
            });
            return user;
          })
        );

        return { ...post, registerUsers, supporterUsers };
      })
    );

    const beautifyRow = map(attachedUser, (row) => {
      delete row.createdAt;
      delete row.updatedAt;
      delete row["Post.id"];
      delete row["Post.userId"];
      delete row["registerId"];
      delete row["supporterId"];

      return row;
    });
    const filterByHashtag = find(filterObj, (row) => row.type === "hashtag");
    const filterByTime = find(filterObj, (row) => row.type === "time");
    let finalResult = beautifyRow;

    if (filterByHashtag && filterByHashtag.value.length > 0) {
      finalResult = map(finalResult, (row) => {
        const intersectionHashtag = intersection(
          JSON.parse(row["Post.hashtag"]),
          filterByHashtag.value
        );
        if (intersectionHashtag.length > 0) {
          return row;
        }
      });
    }

    if (filterByTime) {
    }

    return compact(finalResult);
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "filter",
      message: "Filter input wrong.",
    });
  }
};

const registerDetailOfPost = async (postId) => {
  try {
    const listRegister = await UserPost.findOne({
      where: { postId },
      attributes: ["registerId"],
      raw: true,
    });
    const attachPostData = await Promise.all(
      map(listRegister, async (registerId) => {
        const userData = await User.findAll({
          where: { id: registerId },
          raw: true,
        });
        const userRank = await Ranking.findAll({
          where: { userId: registerId },
          attributes: ["userId", "rankPoint"],
          raw: true,
        });
        return { registerId, userData, userRank };
      })
    );
    return attachPostData;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Post not found.",
    });
  }
};

const supporterDetailOfPost = async (postId) => {
  try {
    const listSupporter = await UserPost.findOne({
      where: { postId },
      attributes: ["supporterId"],
      raw: true,
    });
    const attachPostData = await Promise.all(
      map(listSupporter, async (supporterId) => {
        const userData = await User.findAll({
          where: { id: supporterId },
          raw: true,
        });
        const userRank = await Ranking.findAll({
          where: { userId: supporterId },
          attributes: ["userId", "rankPoint"],
          raw: true,
        });
        return { supporterId, userData, userRank };
      })
    );
    return attachPostData;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Post not found.",
    });
  }
};

const getAllDetailsByPostId = async (postId) => {
  console.log(postId, process.env.DB_NAME);
  try {
    const [commentCount, registers, supporters, postDetails] =
      await Promise.all([
        countPeopleCmtOfPost(postId),
        registerDetailOfPost(postId),
        supporterDetailOfPost(postId),
        postDetailByPostId(postId),
      ]);
    return {
      commentCount,
      registers,
      supporters,
      postDetails,
    };
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "postId",
      message: "Post is not found",
    });
  }
};

const getListHashtag = async (ctx) => {
  const userId = ctx?.user?.id || 2;

  try {
    const listHashtag = UserPost.findAndCountAll({
      where: {
        userId,
        isDone: 0,
      },
      include: [Post],
      group: ["Post.hashTag"],
      raw: true,
    });
    return (await listHashtag).count;
  } catch (error) {
    console.log(error);
  }
};

const getListPostByFilterSupporter = async (params, ctx) => {
  const { filters, limit, offset } = params;
  const userId = ctx?.user?.id || 2;
  const where = {};
  where["isSupporter"] = userId;
  map(filters, (filter) => {
    if (
      ["isPending", "isActive", "isDone", "isConfirmed"].includes(filter.type)
    ) {
      where[filter.type] = filter.value;
    }
    if (filter.type === "eventId") {
      where["eventId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "supporterId") {
      where["supporterId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "registerId") {
      where["registerId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
  });

  return where;

  try {
    const listPost = await UserPost.findAndCountAll({
      where: supportFilters(userId, filters),
      include: [Post],
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const filterByHashtag = find(filters, (row) => row.type === "hashtag");
    const filterByTime = find(filters, (row) => row.type === "time");

    let finalResult = listPost;

    if (filterByHashtag) {
      finalResult = map(finalResult, (row) => {
        const intersectionHashtag = intersection(
          JSON.parse(row["Post.hashtag"]),
          filterByHashtag.value
        );
        if (intersectionHashtag.length > 0) {
          return row;
        } else {
          return [];
        }
      });
    }

    if (filterByTime) {
    }

    return finalResult;
  } catch (error) {
    console.log(error);
    throw new NotFoundError({
      field: "filter",
      message: "Filter input wrong.",
    });
  }
};

const supportFilters = (userId, filters) => {
  const where = {};
  where["isSupporter"] = userId;
  map(filters, (filter) => {
    if (
      ["isPending", "isActive", "isDone", "isConfirmed"].includes(filter.type)
    ) {
      where[filter.type] = filter.value;
    }
    if (filter.type === "eventId") {
      where["eventId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "supporterId") {
      where["supporterId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
    if (filter.type === "registerId") {
      where["registerId"] = filter.value === 1 ? { [Op.ne]: null } : null;
    }
  });

  return where;
};

export default {
  listPostByUserId,
  listAllPost,
  create,
  update,
  edit,
  deletePost,
  getListPostByFilter,
  getAllDetailsByPostId,
  getListHashtag,
};
