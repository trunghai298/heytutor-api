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
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  commentCount: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  comments: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

export default Post;
