import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
import UserPost from "./user-post.model";

interface PostInstance extends Model {
  id: number;
  userId: number;
  title: string;
  content: string;
  minPrice: number;
  hashtag: string;
  images: string;
  isEdited: boolean;
  isSaveDraft: boolean;
  deadline: Date;
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
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  title: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  content: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  minPrice: {
    allowNull: true,
    type: DataTypes.DOUBLE,
  },
  images: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  hashtag: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSaveDraft: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
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

Post.hasMany(UserPost, { foreignKey: "id" });
UserPost.belongsTo(Post, { foreignKey: "postId" });

export default Post;
