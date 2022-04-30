import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface MessageInstance extends Model {
  id: number;
  senderId: number;
  senderName: number;
  receiverId: number;
  receiverName: string;
  conversationId: number;
  message: string;
  isSeen: boolean;
  seenAt: Date;
}

const Message = MySQLClient.define<MessageInstance>("Message", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  senderId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  senderName: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  receiverId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  receiverName: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  conversationId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  message: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  isSeen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  seenAt: {
    allowNull: true,
    type: DataTypes.DATE,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
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

export default Message;
