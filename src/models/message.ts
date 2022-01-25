import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface MessageInstance extends Model {
  id: number;
  senderId: number;
  receiverId: number;
  conversationId: number;
  content: string;
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
  content: {
    type: DataTypes.STRING,
  },
  seenAt: {
    type: DataTypes.DATE,
  },
});

export default Message;
