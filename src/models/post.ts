import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface PostInstance extends Model {
  id: number;
  eventId: number;
  userId: number;
  title: string;
  content: string;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  comments: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Post = MySQLClient.define<PostInstance>("Post", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  title: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.STRING,
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  commentCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
});

export default Post;
