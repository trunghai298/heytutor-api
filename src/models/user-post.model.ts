import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface UserPostInstance extends Model {
  id: number;
  userId: number;
  supporterId: number;
  postId: number;
  eventId: number;
  conversationId: number;
  isResolved: boolean;
  isPending: boolean;
  isActive: boolean;
  isDone: boolean;
  isConfirmed: boolean;
  isEdited: boolean;
}

const UserPost = MySQLClient.define<UserPostInstance>("UserPost", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  supporterId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  conversationId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isResolved: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isPending: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isActive: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isDone: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isConfirmed: {
    type: DataTypes.INTEGER.UNSIGNED,
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
});

export default UserPost;
