import MySQLClient from "../clients/mysql";
import { BadRequestError } from "../utils/errors";
import { map } from "lodash";
import User from "../models/user.model";

/**
 * To search post, user
 */
const search = async (query: string) => {
  try {
    const [postResult, eventResult, userResult] = await Promise.all([
      MySQLClient.query(
        `SELECT * FROM Posts WHERE hashtag LIKE '%${query}%' OR title LIKE '%${query}%' ORDER BY deadline DESC LIMIT 10;`,
        { type: "SELECT" }
      ),
      MySQLClient.query(
        `SELECT * FROM Events WHERE title LIKE '%${query}%' OR content LIKE '%${query}%' ORDER BY endAt DESC limit 10 ;`,
        { type: "SELECT" }
      ),
      MySQLClient.query(
        `SELECT * FROM Users WHERE name LIKE '%${query}%' limit 10;`,
        {
          type: "SELECT",
        }
      ),
    ]);

    const postWithUser = await Promise.all(
      map(postResult, async (post) => {
        const user = await User.findOne({
          where: { id: post.userId },
          attributes: ["name", "avatar", "id"],
          raw: true,
        });
        return { ...post, user };
      })
    );

    return {
      postResult: postWithUser,
      eventResult,
      userResult,
    };
  } catch (error) {
    throw new BadRequestError({
      field: "query",
      message: "Fail to query",
    });
  }
};

export default {
  search,
};
