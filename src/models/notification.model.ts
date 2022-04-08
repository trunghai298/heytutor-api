import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface NotificationInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  eventId: number;
  commentId: number;
  notificationType: string;
  fromUserId: number;
  fromUsername: number;
  status: string;
}

const Notification = MySQLClient.define<NotificationInstance>("Notification", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  commentId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  notificationType: {
    type: DataTypes.STRING,
  },
  fromUserId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  fromUsername: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "unread",
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

export default Notification;
