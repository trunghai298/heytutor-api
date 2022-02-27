import MySQLClient from "../clients/mysql";
import Post from "../models/post";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { isEmpty } from "lodash";
import { map } from "lodash";
import User from "../models/user";
import { Op } from "sequelize";

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

/**
 * To update a new post
 */
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

/**
 * To delete an existed post
 */
const list = async (limit, offset, ctx) => {
  const { user } = ctx;
  const { firstTimeLogin, semester, subjects } = user;
  const subjectsJSON = JSON.parse(subjects.replaceAll("'", ""));

  try {
    let whereCondition = {};
    const titleCondition = subjectsJSON.map((s) => {
      const title = {
        title: {
          [Op.like]: `%${s}%`,
        },
      };
      return title;
    });

    const contentCondition = subjectsJSON.map((s) => {
      const title = {
        content: {
          [Op.like]: `%${s}%`,
        },
      };
      return title;
    });

    if (firstTimeLogin) {
      whereCondition = {
        [Op.or]: [
          {
            hashtag: {
              [Op.in]: subjectsJSON,
            },
          },
          ...titleCondition,
          ...contentCondition,
        ],
        isResolved: false,
      };
    } else {
    }

    const listPost = await Post.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      raw: true,
      logging: true,
      where: { ...whereCondition },
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

        return { ...post, user };
      })
    );

    return attachedUser;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
    });
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

    // const attachedUser = await Promise.all(
    //   map(listPost.rows, async (post) => {
    //     const user = await User.findOne({
    //       where: { id: post.userId },
    //       raw: true,
    //     });

    //     return { ...post, user };
    //   })
    // );

    return listPost;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
    });
  }
};

export default {
  listPostByUserId,
  list,
  create,
  update,
  edit,
  deletePost,
};
