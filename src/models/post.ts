import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface PostInstance extends Model {
  id: number;
  eventId: number;
  userId: number;
  title: string;
  content: string;
  hashtag: string;
  price: boolean;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  images: string;
  isResolved: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;

  // update 28/2
  isSupporter: boolean;
  isChanged: boolean;
  isBaned: boolean;
  isSaveDraf: boolean;
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
  //update 28/2
  
  isSupporter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },isChanged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },isBaned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },isSaveDraf: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Post;
