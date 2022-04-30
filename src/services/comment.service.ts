import Post from "../models/post.model";
import Comment from "../models/comment.model";
import User from "../models/user.model";
import ActivityServices from "./activity.service";
import { NOTI_TYPE } from "../constants/notification";
import { BadRequestError, NotFoundError } from "../utils/errors";
import NotificationService from "./notification.service";
import UserPermissionService from "./user-permission.service";

const fetchById = async (id) =>
  Comment.findByPk(id, {
    include: [{ model: Post, attributes: [""] }],
  });

/**
 * To create a new comment on a post
 */
export const createComment = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { postId, comment } = payload;
  const postInfo = await Post.findOne({
    where: { postId },
    raw: true,
  });

  try {
    if (
      UserPermissionService.checkUserCommentPermission(userId, postInfo.eventId)
    ) {
      const res = await Comment.create({
        postId,
        userId: userId,
        comment,
      });

      const user = await User.findOne({
        where: { userId },
        attributes: ["name"],
        raw: true,
      });

      const log = await ActivityServices.create({
        userId: userId,
        username: user.name,
        action: NOTI_TYPE.NewComment,
        content: `userId: ${userId} create new comment for postId: ${postId}`,
      });

      const result = {
        userId: postInfo.userId,
        postId: postId,
        notificationType: NOTI_TYPE.NewComment,
        fromUserId: userId,
        fromUsername: user.name,
      };
      await NotificationService.create(result);

      return { status: 200 };
    } else {
      throw new BadRequestError({
        field: "ctx",
        message: "You had been baned from comment in the system!!!",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Failed to create this item.",
    });
  }
};

/**
 * To edit a new comment on a post
 */
export const editComment = async (ctx, payload) => {
  const userId = ctx?.user?.id;
  const { comment, commentId } = payload;
  try {
    const previousComment = await Comment.findOne({
      where: {
        commentId,
      },
      attributes: ["comment"],
      raw: true,
    });
    await Comment.update({ comment }, { where: { commentId, userId } });

    const user = await User.findOne({
      where: { userId },
      attributes: ["name"],
      raw: true,
    });

    const log = await ActivityServices.create({
      userId: userId,
      username: user.name,
      action: NOTI_TYPE.UpdateComment,
      content: `userId: ${userId} update commentId: ${commentId} previous value: "${previousComment.comment}"`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Failed to update this item.",
    });
  }
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
      postId,
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
  createComment,
  editComment,
  deleteComment,
  listComments,
};
