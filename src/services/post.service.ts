import { double } from "aws-sdk/clients/lightsail";
import Comment from "../models/comment.model";
import MySQLClient from "../clients/mysql";
import Post from "../models/post.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { isEmpty, omit, pick } from "lodash";
import { map } from "lodash";
import User from "../models/user.model";
import { Op } from "sequelize";
import Student from "../models/student.model";
import UserPost from "../models/user-post.model";
import Register from "../models/register.model";

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

const listPostByUserId = async (userId: string, limit, offset) => {
  try {
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
      attributes: ["userId", "User.name", "User.email"],
      group: ["userId",],
      raw: true,
    });
    const res = map(listUsers, user => {
      const pickFields = pick(user, ["userId", "name", "email"]);
      return pickFields;
    })
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
    const listUsers = await Register.findAll({
      where: {
        postId,
      },
      include: [User],
      attributes: ["userId", "User.name", "User.email"],
      group: ["userId",],
      raw: true,
      logging: true
    });
    const res = map(listUsers, user => {
      const pickFields = pick(user, ["userId", "name", "email"]);
      return pickFields;
    })
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post has no register.",
    });
  }
};

const countPeopleSupporterOfPost = async (postId) => {
  try {
    const listUsers = await UserPost.findAll({
      where: {
        postId,
      },
      include: [User],
      attributes: ["userId", "User.name", "User.email"],
      group: ["userId"],
      raw: true,
    });
    const res = map(listUsers, user => {
      const pickFields = pick(user, ["userId", "name", "email"]);
      return pickFields;
    })
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post has no supporter.",
    });
  }
};

const postDetailByPostId = async (postId) => {
  try {
    const postDetail = await UserPost.findAll({
      where: { postId },
      include: [Post],
      raw: true,
      attributes: { exclude: ["Post.id", "Post.userId", "userId"] },
    });
    const res = map(postDetail, post => {
      const pickFields = omit(post, ["id", "postId", "email"]);
      return pickFields;
    })
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
    });
  }
};

const getAllDetailsByPostId = async (postId) => {
  try {
    const [listUserComment, listUserRegister, listUserSupport, postDetailById] =
      await Promise.all([
        countPeopleCmtOfPost(postId),
        countPeopleRegisterOfPost(postId),
        countPeopleSupporterOfPost(postId),
        postDetailByPostId(postId),
      ]);
    return {
      listUserComment,
      listUserRegister,
      listUserSupport,
      postDetailById,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post is not found",
    });
  }
};

const getListPostByFilter = async (filter, limit, offset) => {
  Post.hasMany(UserPost, { foreignKey: "id" });
  UserPost.belongsTo(Post, { foreignKey: "postId" });

  try {
    const listPost = await UserPost.findAndCountAll({
      where: { ...filter },
      include: [Post],
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      raw: true,
      attributes: { exclude: ["Post.id", "Post.userId"] },
    });
    return listPost;
  } catch (error) {
    throw new NotFoundError({
      field: "filter",
      message: "Filter input wrong.",
    });
  }
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
};
