import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface MessageInstance extends Model {
  id: number;
  senderId: number;
  receiverId: number;
  conversationId: number;
  message: string;
  seenAt: Date;
}

const Message = MySQLClient.define<MessageInstance>("Message", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  senderId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  receiverId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  conversationId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  message: {
    type: DataTypes.STRING,
  },
  seenAt: {
    type: DataTypes.DATE,
    allowNull: false,
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
