import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface PostInstance extends Model {
  id: number;
  eventId: number;
  userId: number;
  supporter: number;
  title: string;
  content: string;
  hashtag: string;
  price: string;
  isLiked: boolean;
  likedBy: string;
  likeCount: number;
  commentCount: number;
  images: string;
  isResolved: boolean;
  isPinned: boolean;
  isPending: boolean;
  isActive: boolean;
  isSupporter: boolean;
  isChanged: boolean;
  isBaned: boolean;
  isSaveDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Post = MySQLClient.define<PostInstance>("Post", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  supporter: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  title: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
  },
  images: {
    type: DataTypes.STRING,
  },
  hashtag: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  likedBy: {
    type: DataTypes.STRING,
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  commentCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSupporter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isChanged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBaned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSaveDraft: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  isPending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Post;
