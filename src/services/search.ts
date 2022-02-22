import MySQLClient from "../clients/mysql";
import Post from "../models/post";
import { BadRequestError } from "../utils/errors";
/**
 * To search post, user
 */
const search = async (query: string) => {
  try {
    const res = await MySQLClient.query(
      `SELECT * FROM Posts WHERE hashtag LIKE '%${query}%' OR title LIKE '%${query}%';`,
      { type: "SELECT" }
    );
    return res;
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
