import { BadRequestError } from "../utils/errors";
import Bookmark from "../models/bookmark";
import { map } from "lodash";
import Post from "../models/post.model";

/**
 * To list of bookmarked posts by user
 */
const listBookmark = async (ctx) => {
  try {
    const res = await Bookmark.findAll({
      where: { userId: ctx.user.id },
      raw: true,
    });
    const listBookmarkedPost = await Promise.all(
      map(res, async (item) => {
        const post = await Post.findOne({
          where: { id: item.postId },
          raw: true,
        });
        return { ...post, user: ctx.user };
      })
    );

    return listBookmarkedPost;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const listBookmarkLite = async (ctx) => {
  try {
    const res = await Bookmark.findAll({
      where: { userId: ctx.user.id },
      raw: true,
    });

    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const addBookmark = async (payload, ctx) => {
  const { postId } = payload;
  const { user } = ctx;
  try {
    const res = await Bookmark.create({ postId, userId: user.id });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const removeBookmark = async (payload, ctx) => {
  const { postId } = payload;
  const { user } = ctx;
  try {
    return Bookmark.destroy({ where: { postId, userId: user.id } });
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  listBookmarkLite,
  removeBookmark,
  addBookmark,
  listBookmark,
};
