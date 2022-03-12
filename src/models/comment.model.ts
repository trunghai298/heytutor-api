import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface CommentInstance extends Model {
  id: number;
  postId: number;
  userId: number;
  isLiked: boolean;
  isEdited: boolean;
  likedBy: string;
  comment: string;
  likeCount: number;
  rollComment: number;
}

const Comment = MySQLClient.define<CommentInstance>("Comment", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  rollComment: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isEdited: {
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
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
});

export default Comment;
