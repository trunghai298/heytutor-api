import { double } from "aws-sdk/clients/lightsail";
import Comment from "../models/comment.model";
import MySQLClient from "../clients/mysql";
import Post from "../models/post.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { isEmpty } from "lodash";
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
const list = async (limit, offset) => {
  try {
    const listPost = await Post.findAndCountAll({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
      order: [["createdAt", "DESC"]],
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
const countPeopleCmtOfPost = async (_postId: double) => {
  try {
    const listUsers = await Comment.findAll({
      where: {
        postId: _postId,
      },
      attributes: ['userId'],
      group: ['userId'],
      raw: true
    });
    return listUsers;
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post has no comment.",
    });
  }
};

const getListPostByUser = async (filter, limit, offset) => {

}

export default {
  list,
  create,
  edit,
  deletePost,
  countPeopleCmtOfPost,
  getListPostByUser,
};
