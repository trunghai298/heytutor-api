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
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  supporterId: {
    allowNull: true,
    type: DataTypes.JSON,
    defaultValue: null,
  },
  registerId: {
    allowNull: true,
    type: DataTypes.JSON,
    defaultValue: null,
  },
  postId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
  },
  isPending: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 1,
  },
  isActive: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isDone: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  isConfirmed: {
    allowNull: false,
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
