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
  const { user } = ctx;
  const { postId, comment } = payload;
  const postInfo = await Post.findOne({
    where: { postId },
    raw: true,
  });

  try {
    if (
      UserPermissionService.checkUserCommentPermission(
        user.id,
        postInfo.eventId
      )
    ) {
      const res = await Comment.create({
        postId,
        userId: user.id,
        comment,
      });

      const log = await ActivityServices.create({
        userId: user.id,
        username: user.name,
        action: NOTI_TYPE.NewComment,
        content: `Người dùng ${user.id} tạo bình luận mới cho vấn đề ${postId}.`,
      });

      const result = {
        userId: postInfo.userId,
        postId: postId,
        notificationType: NOTI_TYPE.NewComment,
        fromUserId: user.id,
        fromUsername: user.name,
      };
      await NotificationService.create(result);

      return { status: 200 };
    } else {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn đang bị cấm bình luận.",
      });
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Không thể tạo bình luận.",
    });
  }
};

/**
 * To edit a new comment on a post
 */
export const editComment = async (ctx, payload) => {
  const { user } = ctx;
  const { comment, commentId } = payload;
  try {
    const previousComment = await Comment.findOne({
      where: {
        id: commentId,
      },
      attributes: ["comment"],
      raw: true,
    });

    await Comment.update(
      { comment },
      {
        where: {
          id: commentId,
          userId: user.id,
        },
      }
    );

    const log = await ActivityServices.create({
      userId: user.id,
      username: user.name,
      action: NOTI_TYPE.UpdateComment,
      content: `Người dùng ${user.id} thay đổi bình luận ${commentId} bình luận trước đấy: "${previousComment.comment}".`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "userId",
      message: "Không thể thay đổi bình luận này.",
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
