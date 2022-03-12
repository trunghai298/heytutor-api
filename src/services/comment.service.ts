import Post from "../models/post.model";
import Comment from "../models/comment.model";
import User from "../models/user.model";

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
export const listComments = async (postId, offset, limit) => {
  const res = await Comment.findAndCountAll({
    where: {
      postId: postId,
    },
    offset: offset || 0,
    limit: limit || 100,
    order: [["createdAt", "DESC"]],
    raw: true,
    logging: true,
  });

  const attachedUser = await Promise.all(
    res.rows.map(async (comment) => {
      const user = await User.findOne({
        where: { id: comment.userId },
        attributes: {
          exclude: ["password"],
        },
        raw: true,
      });
      return { ...comment, user };
    })
  );
  return attachedUser;
};

export default {
  create,
  edit,
  deleteComment,
  listComments,
};
