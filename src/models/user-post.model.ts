import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface UserEventInstance extends Model {
  id: number;
  userId: number;
  suporterId: number;
  postId: number;
  eventId: number;
  conversationId: number;
  isResolved: boolean;
  isPending: boolean;
  isActive: boolean;
  isDone: boolean;
  isConfirmed: boolean;
}

const UserEvent = MySQLClient.define<UserEventInstance>("UserEvent", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  suporterId: {
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

export default UserEvent;
