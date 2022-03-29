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
    type: DataTypes.INTEGER.UNSIGNED,
  },
  senderName: {
    type: DataTypes.STRING,
  },
  receiverId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  receiverName: {
    type: DataTypes.STRING,
  },
  conversationId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  message: {
    type: DataTypes.STRING,
  },
  isSeen: {
    type: DataTypes.BOOLEAN,
  },
  seenAt: {
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
