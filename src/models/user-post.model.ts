import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
import User from "./user.model";

interface UserPostInstance extends Model {
  id: number;
  userId: number;
  registerId: any;
  supporterId: any;
  postId: number;
  eventId: number;
  conversationId: number;
  isPending: boolean;
  isActive: boolean;
  isDone: boolean;
  isConfirmed: boolean;
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
    type: DataTypes.JSON,
    defaultValue: null,
  },
  registerId: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
  },
  conversationId: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
  },
  isPending: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isDone: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isConfirmed: {
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

UserPost.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserPost, { foreignKey: "id" });

export default UserPost;
