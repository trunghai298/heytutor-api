import MySQLClient from "../clients/mysql";
import Post from "../models/post";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { isEmpty, sortBy, uniqBy } from "lodash";
import { map } from "lodash";
import User from "../models/user";
import { Op } from "sequelize";
import Student from "../models/student";
import BookmarkServices from "./bookmark";

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

const likePost = async (payload, ctx) => {
  const { postId } = payload;
  const { user } = ctx;

  const transaction = await MySQLClient.transaction();
  let params = null;
  try {
    const post = await Post.findOne({ where: { id: postId }, raw: true });
    if (post.isLiked) {
      params = {
        isLiked: false,
        likeCount: post.likeCount - 1,
        likedBy: JSON.stringify(
          JSON.parse(post.likedBy).filter((userId) => userId !== user.id)
        ),
      };
    } else {
      params = {
        isLiked: true,
        likeCount: post.likeCount + 1,
        likedBy: post.likedBy
          ? JSON.stringify([...JSON.parse(post.likedBy), user.id])
          : JSON.stringify([user.id]),
      };
    }

    await Post.update({ ...params }, { where: { id: postId }, transaction });
    await transaction.commit();
    const postUpdated = await Post.findOne({
      where: { id: postId },
      raw: true,
    });

    return postUpdated;
  } catch (error) {
    console.log(error);
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

/**
 * To list post for specific user
 */
const listPostByUser = async (limit, offset, ctx) => {
  const { user } = ctx;
  const { firstTimeLogin, semester, major, subjects } = user;
  const subjectsJSON = JSON.parse(subjects);

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

    const hashtagCondition = subjectsJSON.map((s) => {
      const title = {
        hashtag: {
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
        [Op.or]: [...hashtagCondition, ...titleCondition, ...contentCondition],
        isResolved: false,
      };
    } else {
      whereCondition = {
        isResolved: false,
      };
    }

    const listPost = await Post.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
      // logging: true,
      raw: true,
      where: { ...whereCondition },
    });

    const bookmarkedPost = await BookmarkServices.listBookmark(ctx);

    const attachedUser = await Promise.all(
      map(listPost.rows, async (post) => {
        const userDb = await User.findOne({
          where: { id: post.userId },
          raw: true,
          attributes: {
            exclude: ["password"],
          },
        });

        const studentData = await Student.findOne({
          where: { stdId: userDb.stdId },
          raw: true,
        });

        return { ...post, user: { ...userDb, ...studentData } };
      })
    );

    // const sortListPostByMajor = sortBy(attachedUser, (post) => {
    //   return post.user.major === major;
    // }).reverse();

    const concatBookmarkPost = uniqBy(
      attachedUser.concat(bookmarkedPost),
      "id"
    );

    return concatBookmarkPost;
  } catch (error) {
    throw new BadRequestError({
      field: "postId",
      message: "Failed to list post.",
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
  likePost,
  listPostByUserId,
  listPostByUser,
  listAllPost,
  create,
  update,
  edit,
  deletePost,
};
