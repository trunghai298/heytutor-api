import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface CommentInstance extends Model {
  id: number;
  postId: number;
  userId: number;
  isLiked: boolean;
  likedBy: string;
  comment: string;
  likeCount: number;
}

const Comment = MySQLClient.define<CommentInstance>("Comment", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  likedBy: {
    type: DataTypes.STRING,
  },
  comment: {
    type: DataTypes.STRING,
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
});

export default Comment;
