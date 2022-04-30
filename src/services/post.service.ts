import { NOTI_TYPE } from "./../constants/notification";
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
import userPermissionService from "./user-permission.service";
import activityService from "./activity.service";
/**
 * To create a new post
 */
const create = async (ctx, payload) => {
  const { eventId, title, hashtag, minPrice, content, images, deadline } =
    payload;
  const { user } = ctx;

  try {
    if (isEmpty(payload.content)) {
      throw new BadRequestError({
        field: "content",
        message: "Failed to create this post.",
      });
    } else if (
      userPermissionService.checkUserCreatePostPermission(user.id, eventId)
    ) {
      const post = await Post.create({
        userId: user.id,
        title: title,
        hashtag: hashtag,
        minPrice: minPrice,
        content: content,
        images: images,
        deadline,
      });

      await UserPost.create({
        userId: user.id,
        postId: post.id,
        eventId: eventId,
      });

      const log = await activityService.create({
        userId: user.id,
        username: user.name,
        action: NOTI_TYPE.NewPost,
        content: `Người dùng ${user.id} tạo vấn đề ${post.id}`,
      });

      return post;
    } else {
      throw new BadRequestError({
        field: "Lệnh cấm còn hiệu lực!!!",
        message: "Người dùng không có quyền tạo vấn đề vào lúc này",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Không thể tạo vấn đề vào lúc này",
    });
  }
};

// const update = async (ctx, payload) => {
//   const { user } = ctx;
//   const { postId } = payload;
//   const transaction = await MySQLClient.transaction();

//   try {
//     const post = await Post.findOne({ where: { id: postId } });
//     if (!post) {
//       throw new NotFoundError({
//         field: "id",
//         message: "Không thể tìm được vấn đề!",
//       });
//     }

//     await Post.update({ ...payload }, { where: { id: postId }, transaction });
//     await transaction.commit();

//     const log = await activityService.create({
//       userId: user.id,
//       username: user.name,
//       action: NOTI_TYPE.UpdatePost,
//       content: `Người dùng ${user.id} tạo post ${post.id}`,
//     });

//     const postUpdated = await Post.findOne({ where: { id: postId } });
//     return postUpdated;
//   } catch (error) {
//     await transaction.rollback();
//     throw new BadRequestError({
//       field: "postId",
//       message: "Không thể cập nhật vấn đề này.",
//     });
//   }
// };

/**
 * To edit an existed post
 */
const edit = async (ctx, payload) => {
  const { postId, title, content, deadline } = payload;
  const { user } = ctx;
  const transaction = await MySQLClient.transaction();
  try {
    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundError({
        field: "id",
        message: "Không thể tìm được vấn đề.",
      });
    }

    const updatedPost = await Post.update(
      { title, content, deadline },
      { where: { id: postId }, transaction }
    );
    await transaction.commit();

    const log = await activityService.create({
      userId: user.id,
      username: user.name,
      action: NOTI_TYPE.UpdatePost,
      content: `Người dùng ${user.id} cập nhật vấn đề ${post.id}, dữ liệu cũ: ${payload}`,
    });

    return updatedPost;
  } catch (error) {
    await transaction.rollback();
    throw new BadRequestError({
      field: "postId",
      message: "Có lỗi khi cập nhật vấn đề này.",
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
    const userId = ctx?.user?.id;

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
    console.log(error);
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
      logging: true,
      attributes: { exclude: ["Post.id", "Post.userId", "userId"] },
    });
    const user = await User.findOne({
      where: { id: postDetail["Post.userId"] },
      raw: true,
    });

    const res = omit(postDetail, [
      "id",
      "postId",
      "email",
      "supporterId",
      "registerId",
    ]);

    return { ...res, user };
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
  const userId = ctx?.user?.id;

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
    if (listRegister.registerId !== null) {
      const listUserRegister = await Promise.all(
        map(listRegister.registerId, async (registerId) => {
          const userData = await User.findOne({
            where: { id: registerId },
            raw: true,
          });
          const userRank = await Ranking.findOne({
            where: { userId: registerId },
            attributes: ["voteCount", "rankPoint"],
            raw: true,
          });
          return { ...userData, ...userRank };
        })
      );
      return listUserRegister;
    } else return null;
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

    if (listSupporter.supporterId !== null) {
      const attachPostData = await Promise.all(
        map(listSupporter.supporterId, async (supporterId) => {
          const userData = await User.findOne({
            where: { id: supporterId },
            raw: true,
          });
          const userRank = await Ranking.findOne({
            where: { userId: supporterId },
            attributes: ["voteCount", "rankPoint"],
            raw: true,
          });

          return { ...userData, ...userRank };
        })
      );
      return attachPostData;
    } else return null;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Post not found.",
    });
  }
};

const getAllDetailsByPostId = async (postId) => {
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
  const userId = ctx?.user?.id;

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

// const getListPostByFilterSupporter = async (params, ctx) => {
//   const { filters, limit, offset } = params;
//   const userId = ctx?.user?.id;
//   const where = {};
//   where["isSupporter"] = userId;
//   map(filters, (filter) => {
//     if (
//       ["isPending", "isActive", "isDone", "isConfirmed"].includes(filter.type)
//     ) {
//       where[filter.type] = filter.value;
//     }
//     if (filter.type === "eventId") {
//       where["eventId"] = filter.value === 1 ? { [Op.ne]: null } : null;
//     }
//     if (filter.type === "supporterId") {
//       where["supporterId"] = filter.value === 1 ? { [Op.ne]: null } : null;
//     }
//     if (filter.type === "registerId") {
//       where["registerId"] = filter.value === 1 ? { [Op.ne]: null } : null;
//     }
//   });

//   return where;

//   try {
//     const listPost = await UserPost.findAndCountAll({
//       where: supportFilters(userId, filters),
//       include: [Post],
//       limit: parseInt(limit, 10) || 100,
//       offset: parseInt(offset, 10) || 0,
//       order: [["createdAt", "DESC"]],
//       raw: true,
//     });

//     const filterByHashtag = find(filters, (row) => row.type === "hashtag");
//     const filterByTime = find(filters, (row) => row.type === "time");

//     let finalResult = listPost;

//     if (filterByHashtag) {
//       finalResult = map(finalResult, (row) => {
//         const intersectionHashtag = intersection(
//           JSON.parse(row["Post.hashtag"]),
//           filterByHashtag.value
//         );
//         if (intersectionHashtag.length > 0) {
//           return row;
//         } else {
//           return [];
//         }
//       });
//     }

//     if (filterByTime) {
//     }

//     return finalResult;
//   } catch (error) {
//     console.log(error);
//     throw new NotFoundError({
//       field: "filter",
//       message: "Filter input wrong.",
//     });
//   }
// };

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
  // update,
  edit,
  deletePost,
  getListPostByFilter,
  getAllDetailsByPostId,
  getListHashtag,
  countPeopleSupporterOfPost,
};
