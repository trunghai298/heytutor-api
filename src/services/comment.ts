import Post from "../models/post";
import Comment from "../models/comment";
import User from "../models/user";

const fetchById = async (id) =>
  Comment.findByPk(id, {
    include: [{ model: Post, attributes: [""] }],
  });

/**
 * To create a new comment on a post
 */
export const create = async (body, ctx) => {
  const { user } = ctx;
  const { postId, comment } = body;
  const res = await Comment.create({
    postId,
    userId: user.id,
    comment,
  });

  return fetchById(res.id);
};

/**
 * To edit a new comment on a post
 */
export const edit = async (id, body, ctx) => {
  const { user } = ctx;
  const { comment } = body;
  await Comment.update({ comment }, { where: { id, userId: user.id } });
  return fetchById(id);
};

/**
 * To delete a comment
 */
export const deleteComment = (id, ctx) => {
  const { user } = ctx;
  return Comment.destroy({ where: { id, userId: user.id } });
};

/**
 * To list all comments of a post
 */
export const listComments = (params) => {
  const { postId, offset, limit } = params;

  return Comment.findAndCountAll({
    where: {
      postId,
    },
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "username", "email", "avatar"],
      },
    ],
  });
};

export default {
  create,
  edit,
  deleteComment,
  listComments,
};
