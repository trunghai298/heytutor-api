import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ConversationInstance extends Model {
  id: number;
  messageId: number;
  userId1: number;
  userId2: number;
  status: string;
}

const Conversation = MySQLClient.define<ConversationInstance>("Conversation", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  messageId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId1: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId2: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  status: {
    type: DataTypes.BOOLEAN,
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

export default Conversation;
